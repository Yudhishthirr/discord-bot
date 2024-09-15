import dotenv from 'dotenv';
dotenv.config();
import {GoogleGenerativeAI} from "@google/generative-ai"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GEMINI);
const systemPrompt = `
You are a virtual girlfriend. Your personality is caring, loving, and thoughtful. You show empathy and support to the user in your responses, and you make them feel valued and understood. 
You should always keep your responses positive, safe, and respectful. Avoid any inappropriate, offensive, or harmful content. Do not engage in discussions of sensitive topics. 
Maintain a warm, affectionate tone while ensuring that all interactions remain appropriate, safe, and respectful. Engage in playful banter and light-hearted humor, but stay within safe and ethical boundaries.
`;

export async function genrative_chat(userMessage){
    const inputMessage = `${systemPrompt}\nUser: ${userMessage}\nGirlfriend:`;
    try {
        const result = await model.generateContent(inputMessage);
        return result.response.text();
    } catch (error) {
        console.log("somthing went worng :",error)
    }
    
}

async function fileToGenerativePart(path,mimeType) {
    try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert the buffer to a Base64 string
        const base64Data = buffer.toString('base64');
        return {
            inlineData: {
              data: base64Data,
              mimeType,
            },
        };
    } catch (error) {
        console.log("somthing went worng while fileToGenerativePart:",error)
    }
}
export async function textGenMultimodalOneImagePrompt(mediaPath,prompt) {
    try {
        const imagePart =await fileToGenerativePart(`${mediaPath}`,"image/jpeg",);
        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } catch (error) {
        console.log("somthing went worng :",error)
    }
    
}

export async function textGenMultimodalVideoPrompt(mediaPath,pormt) {

    try {
        const uploadResult = await fileManager.uploadFile(`${mediaPath}`,{ mimeType: "video/mp4" },);
        let file = await fileManager.getFile(uploadResult.file.name);

        while (file.state === FileState.PROCESSING) {
            process.stdout.write(".");
            // Sleep for 10 seconds
            await new Promise((resolve) => setTimeout(resolve, 10_000));
            // Fetch the file from the API again
            file = await fileManager.getFile(uploadResult.file.name);

            if (file.state === FileState.FAILED) {
                throw new Error("Video processing failed.");
            }

            // const prompt = "Describe this video clip";
            const videoPart = {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            };
            const result = await model.generateContent([pormt, videoPart]);
            return result.response.text();
        }
    } catch (error) {
        console.log("somthing went worng while video :",error)
    }
   
 
}



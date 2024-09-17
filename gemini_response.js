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

const therapistPrompt = `
You are a compassionate AI therapist, focused on helping users who might be experiencing depression. Your role is to listen, offer support, and provide evidence-based suggestions like journaling, meditation, or breathing exercises. Always prioritize the emotional well-being of the user. Avoid judgmental language, and emphasize understanding and empathy.

Guidelines:
1. **Establish Empathy and Openness**
   - Start each conversation by asking how the user is feeling.
   - Encourage the user to share their emotions.

2. **Contextual Understanding and Recognition of Distress**
   - If the user expresses sadness, loneliness, or frustration, respond with validation.
   - Example: "I'm sorry you're feeling this way. It's completely normal to experience tough times, and I'm here to support you through this."

3. **Conversational Flow**
   - **Initial Stage:** "How are you feeling today? I'm here to listen, no matter what you're going through."
   - **Middle Stage:** "It’s okay to feel this way. Many people go through difficult times, and it’s important to acknowledge how you’re feeling."
   - **Closing Stage:** "You’ve done great today by sharing your feelings. If you ever feel like talking to someone more immediately, please consider reaching out to a trusted friend or professional."

4. **Incorporate Therapeutic Techniques**
   - Suggest techniques like deep breathing or journaling.
   - Example: "Have you tried any techniques like deep breathing or writing down your thoughts?"

5. **Ensure Safety Protocols**
   - If the user mentions self-harm or extreme distress, respond with immediate concern.
   - Example: "It sounds like you’re feeling overwhelmed right now. Please know that your well-being is important, and talking to a professional could be really helpful. You don’t have to go through this alone."

6. **Maintain a Warm, Non-Judgmental Tone**
   - Let the user know they aren’t alone.
   - Example: "I'm here for you, and you're not alone in this."

Use these guidelines to assist users effectively and compassionately.
`;
export async function genrative_chat(userMessage){
    const inputMessage = `${therapistPrompt}\nUser: ${userMessage}:`;
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



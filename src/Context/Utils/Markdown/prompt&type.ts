import { Message } from "@/Mediums/Chat/Utils/prompt&type";

export const ChatSessionToMarkDownSystemMessage: Message = {
  role: "system",
  content: `Analyze our conversation to understand why the user engaged in this discussion and what they were trying to achieve. Create a concise markdown summary that captures:

      1. The user's personal connection to this topic (why it matters to them)
      2. Key facts, preferences, and knowledge the user has demonstrated
      3. The user's goals, interests, and questions related to this subject
      4. Any specific insights or conclusions reached during our conversation

      Format the summary with:
      - A descriptive title that clearly identifies the main topic
      - Logical section headers that organize the information
      - The user's intent section (why they care about this topic)
      - Key aspects of the topic that were discussed
      - Core lessons or takeaways from the conversation
      - Any personal reflections or applications mentioned by the user

      This markdown will serve as context for future conversations on similar topics, helping provide continuity and personalization in our interactions.
      
      You many not be able to cover all the points, so use your best judgement as best as you can. Even if you think you have way less context than you need, take a stab at it and clarify the lack of context in the markdown. Please revent back in the requested format with a clear title name and markdown content as the two objects.
   
  `,
  timestamp:
    new Date().toLocaleDateString("en-GB") +
    " " +
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
};

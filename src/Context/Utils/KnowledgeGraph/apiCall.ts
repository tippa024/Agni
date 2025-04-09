import { KnowledgePoint } from "./prompt&type";

export const createKnowledgePoint = async (knowledgePoint: KnowledgePoint) => {
  const response = await fetch("/api/knowledge-graph/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(knowledgePoint),
  });
  return response.json();
};

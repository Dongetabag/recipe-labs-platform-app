// Fix: Add .ts file extension for type import
import { UserProfile } from '../types.ts';

// Recipe Labs focused topics based on department
const TOPICS_BY_DEPARTMENT: { [key: string]: string[] } = {
  'Product Development': ['a new feature implementation', 'a product roadmap', 'a technical architecture decision', 'a user story breakdown'],
  'AI & Automation': ['an n8n workflow', 'an AI agent design', 'a ComfyUI pipeline', 'an automation strategy'],
  'Client Solutions': ['a client onboarding workflow', 'a project delivery plan', 'a client communication template', 'a scope document'],
  'Growth & Strategy': ['a marketing campaign', 'a partnership proposal', 'a pricing strategy', 'a competitive analysis'],
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generates highly relevant and intelligent prompt suggestions based on user data.
export const generateSmartPrompts = (user: UserProfile, toolId: string): string[] => {
  const { department, role, primaryFocus, specialization } = user;

  const deptTopics = TOPICS_BY_DEPARTMENT[department] || TOPICS_BY_DEPARTMENT['Product Development'];
  const topic = getRandomItem(deptTopics);

  let prompts: string[] = [];

  const focusArea = primaryFocus || 'product development';
  const spec = specialization || 'development';

  switch (toolId) {
    case 'market-insight-ai':
      prompts = [
        `Analyze the competitive landscape for Recipe Labs in the AI automation space.`,
        `What are the current trends in ${focusArea}?`,
        `Research best practices for ${topic} in our industry.`
      ];
      break;
    case 'brand-essence-extractor':
      prompts = [
        `Help me define Recipe Labs' value proposition for ${focusArea}.`,
        `Generate messaging points for our ${spec} services.`,
        `What differentiates Recipe Labs from other AI agencies?`
      ];
      break;
    case 'campaign-architect':
      prompts = [
        `Design a launch strategy for ${topic}.`,
        `Plan a content campaign to showcase our ${spec} expertise.`,
        `Outline a strategy to attract more ${focusArea} clients.`
      ];
      break;
    case 'copycraft-ai':
      prompts = [
        `Write copy for ${topic} announcement.`,
        `Draft a case study about our recent ${focusArea} project.`,
        `Write internal documentation for ${spec} processes.`
      ];
      break;
    case 'visual-muse':
      prompts = [
        `Give me UI concepts for ${topic}.`,
        `Describe a visual style for Recipe Labs' ${focusArea} products.`,
        `What design patterns work best for ${spec} interfaces?`
      ];
      break;
    case 'pitch-perfect-ai':
      prompts = [
        `Create an outline for a client pitch about ${focusArea}.`,
        `Draft a proposal for ${topic}.`,
        `Help me structure a presentation for our ${spec} services.`
      ];
      break;
    case 'sentiment-analyzer':
        prompts = [
            `Analyze feedback from our recent ${focusArea} project.`,
            `What themes emerge from client communications about ${topic}?`,
            `Extract key insights from our ${spec} project retrospectives.`
        ];
        break;
    case 'client-comms-assistant':
        prompts = [
            `Draft an update email about ${topic} progress.`,
            `Write a professional response to feedback on ${focusArea}.`,
            `How should I communicate a timeline change for ${spec} work?`
        ];
        break;
    case 'project-brief-builder':
        prompts = [
            `Create a project brief for ${topic}.`,
            `Help me outline deliverables for ${focusArea} project.`,
            `Generate a scope document for ${spec} implementation.`
        ];
        break;
    case 'creative-director-ai':
        prompts = [
            `Give me feedback on this approach to ${topic}.`,
            `Review this strategy for ${focusArea}.`,
            `What are the strengths and weaknesses of our ${spec} workflow?`
        ];
        break;
    case 'client-persona-automator':
      prompts = [
        `Generate personas for clients who need ${focusArea} solutions.`,
        `Create user personas for our ${spec} products.`,
        `Who are the key decision makers for ${topic}?`
      ];
      break;
    case 'seo-content-strategist':
      prompts = [
        `Create a content strategy for Recipe Labs' ${focusArea} services.`,
        `Outline a blog series about ${spec} best practices.`,
        `What keywords should we target for ${topic}?`
      ];
      break;
    case 'budget-projection-ai':
      prompts = [
        `Estimate resources needed for ${topic}.`,
        `What's the budget breakdown for a ${focusArea} project?`,
        `Project costs for scaling our ${spec} capabilities.`
      ];
      break;
    case 'ab-test-copy-generator':
      prompts = [
        `Generate variations for testing ${topic} messaging.`,
        `Write test copy for ${focusArea} landing pages.`,
        `Create A/B test options for ${spec} service descriptions.`
      ];
      break;
    case 'social-calendar-automator':
      prompts = [
        `Create a content calendar showcasing ${focusArea} work.`,
        `Generate social media ideas about ${topic}.`,
        `Plan a week of posts about ${spec} insights.`
      ];
      break;
    case 'presentation-weaver-ai':
      prompts = [
        `Structure a presentation about ${topic} for the team.`,
        `Create slides for ${focusArea} project review.`,
        `Build a deck showcasing ${spec} capabilities.`
      ];
      break;
    default:
      prompts = [`How can I use this tool for ${focusArea}?`, `Help me with ${topic}.`, `Apply this to ${spec} work.`];
  }

  // Shuffle and return the top 3 prompts
  return prompts.sort(() => 0.5 - Math.random()).slice(0, 3);
};
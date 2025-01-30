![View of Empire State Building to Lower Manhattan in New York][image1]

# AutoCRM: AI-powered Customer Relationship Management

# Background

Customer Relationship Management (CRM) applications, like Zendesk, are central to many businesses. They help support and sales teams manage diverse customer interactions while integrating with other essential tools.

CRMs often direct users to FAQs and help articles before allowing them to submit a ticket. However, many issues still require manual support, making CRMs one of the biggest sources of human labor.

AutoCRM leverages generative AI to minimize this workload and enhance the customer experience. By integrating existing help resources with the capabilities of LLMs, AutoCRM delivers an interactive support and sales experience with minimal human involvement. While some tickets may still require manual handling, the threshold is significantly raised, improving operational efficiency and boosting profitability.

# Submission Guidelines

At the end of each week, you’ll need to submit the following to the GauntletAI LMS:

1. A link to your project’s GitHub repository.  
2. The Brainlifts you used to learn about and enhance the application.  
3. A 5-minute walkthrough showcasing what you’ve built (and, where relevant, how you built it).  
4. A link to your project post on X, along with evidence of engagement with any feedback received.  
5. A link to the working deployed application.

# Baseline App (Week 1\)

### **Building a Modern Customer Support System**

Creating a modern customer support system requires a balanced focus on technical architecture, user experience, and customer-facing features. This document outlines the core functionalities required for a robust, scalable, and adaptable system. Your goal is to rebuild as many of the following components as possible.

To pass the Rebuild portion of this project, you **must implement at least 3-5 features**. You can choose from any of the features listed below. The features you choose should build a cohesive user experience and move the app towards MVP. 

### **Core Architecture**

#### **Ticket Data Model**

The ticket system is central to AutoCRM, treated as a living document that captures the entire customer interaction journey. Key components include:

* **Standard Identifiers & Timestamps**: Basic fields like ticket ID, creation date, and status updates.  
* **Flexible Metadata**:  
  * **Dynamic Status Tracking**: Reflects team workflows.  
  * **Priority Levels**: Manage response times effectively.  
  * **Custom Fields**: Tailor tickets to specific business needs.  
  * **Tags**: Enable categorization and automation.  
  * **Internal Notes**: Facilitate team collaboration.  
  * **Full Conversation History**: Includes interactions between customers and team members.

### **API-First Design**

An API-first approach ensures accessibility and scalability, enabling:

* **Integration**: Connect seamlessly with websites, applications, and external tools.  
* **Automation**: Simplify routine tasks and workflows.  
* **AI Enhancements**: Lay the groundwork for future features.  
* **Analytics**: Support robust reporting and insights.

**API Features:**

* **Synchronous Endpoints**: Handle immediate operations.  
* **Webhooks**: Support event-driven architectures.  
* **Granular Permissions**: Ensure secure integrations using API key authentication.

### **Employee Interface**

#### **Queue Management**

* **Customizable Views**: Prioritize tickets effectively.  
* **Real-Time Updates**: Reflect changes instantly.  
* **Quick Filters**: Focus on ticket states and priorities.  
* **Bulk Operations**: Streamline repetitive tasks.

  #### **Ticket Handling**

* **Customer History**: Display detailed interaction logs.  
* **Rich Text Editing**: Craft polished responses.  
* **Quick Responses**: Use macros and templates.  
* **Collaboration Tools**: Share internal notes and updates.

  #### **Performance Tools**

* **Metrics Tracking**: Monitor response times and resolution rates.  
* **Template Management**: Optimize frequently used responses.  
* **Personal Stats**: Help agents improve efficiency.

### **Administrative Control**

#### **Team Management**

* Create and manage teams with specific focus areas.  
* Assign agents based on skills.  
* Set coverage schedules and monitor team performance.

  #### **Routing Intelligence**

* **Rule-Based Assignment**: Match tickets using properties.  
* **Skills-Based Routing**: Assign issues based on expertise.  
* **Load Balancing**: Optimize workload distribution across teams and time zones.

### **Data Management**

#### **Schema Flexibility**

* **Easy Field Addition**: Add new fields and relationships.  
* **Migration System**: Simplify schema updates.  
* **Audit Logging**: Track all changes.  
* **Archival Strategies**: Manage historical data efficiently.

  #### **Performance Optimization**

* **Caching**: Reduce load for frequently accessed data.  
* **Query Optimization**: Improve system efficiency.  
* **Scalable Storage**: Handle attachments and large datasets.  
* **Regular Maintenance**: Ensure smooth operation.

### **Customer Features**

#### **Customer Portal**

* **Ticket Tracking**: Allow customers to view, update, and track their tickets.  
* **History of Interactions**: Display previous communications and resolutions.  
* **Secure Login**: Ensure privacy with authentication.

  #### **Self-Service Tools**

* **Knowledge Base**: Provide searchable FAQs and help articles.  
* **AI-Powered Chatbots**: Offer instant answers to repetitive queries.  
* **Interactive Tutorials**: Guide customers through common issues step-by-step.

  #### **Communication Tools**

* **Live Chat**: Enable real-time support conversations.  
* **Email Integration**: Allow ticket creation and updates directly via email.  
* **Web Widgets**: Embed support tools on customer-facing websites or apps.

  #### **Feedback and Engagement**

* **Issue Feedback**: Collect feedback after ticket resolution.  
* **Ratings System**: Let customers rate their support experience.

  #### **Multi-Channel Support**

* **Mobile-Friendly Design**: Ensure support tools work on all devices.  
* **Omnichannel Integration**: Support interactions via chat, social media, and SMS.

  #### **Advanced Features**

* **Personalized Suggestions**: Use AI to recommend relevant articles or guides.  
* **Proactive Notifications**: Alert customers about ticket updates or events.  
* **Multilingual Support**: Offer help in multiple languages.

# AI Features (Week 2\)

The following features are **only *suggestions***. We are not trying to confine you to these 3 ideas. You have leeway to pick the AI features for your CRM based on your target user and market. When selecting AI features, ensure they: 

1\) address actual problems reported by users, 

2\) integrate naturally with the application you developed last week,

3\) include accuracy metrics that can verify if the feature successfully solved the user's problem.

## Suggested Feature: AutoCRM

### What is the worst part of a CRM? Constantly having to click, input, and update forms across multiple objects and screens. This manual updating process can be a huge time sink for teams across industries. What if we used AI to introduce a new way of object data creation and maintenance?   This feature is called *AutoCRM*. Imagine this: You login into your CRM dashboard and click an icon to open a chat interface in your right sidebar. You instruct the agent using chat or voice to complete a specific action within your organization. For example, “Add notes to the student record for Christopher Walker based on these meeting notes…” The agent would identify which object needs to be updated, which fields need to be edited specifically within that object, parse clear notes from the context given, identify the tables that need to be updated, call a tool to update Supabase, and show confirmation on screen.

AutoCRM lets users save time by automating data entry and maintenance. Instead of clicking through several windows, scrolling endlessly, and updating forms manually, AutoCRM uses clear directives to do tasks for you. To ensure accuracy, AutoCRM walks through the process step-by-step in your chat window. You can revert the action immediately if it was done incorrectly, check where AutoCRM made a mistake, and give feedback on how to improve next time.

## Suggested Feature: InsightPilot

What's harder than collecting data in your CRM? Making sense of it all. Teams often struggle to surface meaningful patterns and actionable insights from their growing database of customer interactions, conversion progress, and engagement metrics. 

This is where *InsightPilot* comes in. Imagine this: You're reviewing a student's profile and notice a small lightbulb icon pulsing in your navigation bar. When clicked, it expands into an intelligent insights panel that proactively surfaces relevant patterns and correlations using data across your entire student body. For example, "Based on Christopher's recent engagement patterns and similar student profiles, there's an 85% chance he'll need additional support in mathematics next semester..."

InsightPilot transforms raw CRM data into strategic foresight. Instead of manually cross-referencing multiple student records and trying to spot trends, InsightPilot uses LLMs to surface actionable insights in real-time. The system doesn't just analyze individual records \- it understands the relationships between different data points across your entire student population. To maintain transparency, InsightPilot always shows its reasoning process, citing specific data points that led to each insight. You can drill down into any insight to see the underlying analysis, save insights for later review, or mark them as irrelevant to help the system learn your preferences.

This feature moves your CRM from a simple data repository to an intelligent partner in customer success. In the case mentioned above, it helps identify at-risk students before they fall behind, spots emerging trends in academic performance, and suggests personalized intervention strategies based on what has worked for similar students in the past. The insights become more refined over time as the system learns from your team's feedback and accumulates more data points about successful student outcomes.

## Suggested Feature: OutreachGPT

What's one of the most time-consuming parts of customer engagement? Crafting personalized, context-aware messages that strike the right tone and include relevant details. While template emails exist, they often feel generic and miss important context from the customer journey. This is where *OutreachGPT* transforms your communication workflow. 

Imagine this: You need to reach out to several students about their upcoming academic review. Instead of copying and pasting templates, you click the OutreachGPT icon and say "Draft a check-in email for James Chen, mentioning his recent achievements and remind him about our academic planning session next week." The system crafts a personalized message that pulls relevant details from his CRM record, matches your staff member’s tone, and includes specific talking points based on his academic journey.

OutreachGPT turns communication from a manual chore into an intelligent partnership. Instead of starting each message from scratch or using rigid templates, OutreachGPT generates thoughtful drafts that consider the student's full context – their academic performance, extracurricular involvement, past interactions, and upcoming milestones. The system doesn't just merge basic fields; it understands relationships between different aspects of the student's journey to create truly personalized communications. Each draft can be reviewed and edited before sending, and the system learns from your modifications to better match your communication style over time.

This feature maintains the personal touch of customer engagement while dramatically reducing the time spent on communication tasks. You can batch-generate personalized messages for groups of customers while ensuring each one feels individually crafted. OutreachGPT also suggests optimal sending times based on past engagement patterns, tracks response rates, and learns which communication styles are most effective for different types of customers and situations. It even helps maintain consistent communication frequency by proactively suggesting when it's time to check in with customers you haven't contacted recently.

# Important Technical Decisions (ITDs)

## 1\. Backend Infrastructure Selection

**Decision**: Use Supabase as the primary backend infrastructure

**Options Considered**:

* Supabase  
* AWS/Google/Azure cloud services  
* Firebase

**Reason**:

* Supabase provides a narrow, focused set of operations that make it more effective for AI integration.  
* Offers comprehensive foundation services in a single platform:  
  * Authentication with multiple SSO providers  
  * Database and object storage  
  * Edge Functions for custom business logic  
  * Built-in Vector data store  
  * REST and GraphQL APIs  
  * Row Level Security (RLS) for authorization  
  * Eventing system and real-time data synchronization  
* Simpler API surface area compared to alternatives (e.g., AWS's 10,000+ API calls)  
* Built-in AI agent support  
* Reduces complexity in IAM and security configuration  
* Great tooling for multi-branch development  
* Supabase is an open-source implementation of Firebase-like system and deploys on AWS or any other cloud provider.

**Resources:**

* [https://www.youtube.com/watch?v=dU7GwCOgvNY\&pp=ygUPc3VwYWJhc2UgY291cnNl](https://www.youtube.com/watch?v=dU7GwCOgvNY&pp=ygUPc3VwYWJhc2UgY291cnNl)  
* [https://www.youtube.com/watch?v=ydz7Dj5QHKY\&list=PL4cUxeGkcC9hUb6sHthUEwG7r9VDPBMKO](https://www.youtube.com/watch?v=ydz7Dj5QHKY&list=PL4cUxeGkcC9hUb6sHthUEwG7r9VDPBMKO)  
* [https://www.youtube.com/watch?v=zBZgdTb-dns\&pp=ygUPc3VwYWJhc2UgY291cnNl](https://www.youtube.com/watch?v=zBZgdTb-dns&pp=ygUPc3VwYWJhc2UgY291cnNl)

## 2\. Development Tool Selection

**Decision**: Use Lovable \+ Cursor combination for development

**Options Considered**:

* Single LLM interactions  
* Traditional IDE-based development  
* Lovable \+ Cursor combination  
* Supabase UI Agent

**Reason**:

* Single LLM interactions require too much manual effort for feedback loops  
* Traditional development is slower  
* Lovable \+ Cursor combination provides:  
  * 20-50x improvement in development speed  
  * Great support and understanding of Supabase API and subsystems.  
  * Simple Supabase library available for most common platforms.  
  * Comprehensive feedback loops across all system aspects  
  * Superior debugging and bug-fixing capabilities  
  * Complementary strengths without conflicting assumptions  
  * Natural language interface for rapid development  
  * Github integration for version control  
  * Automated deployment capabilities  
* Lovable is your primary interface that force a product manager thinking  
* When Lovable can’t dig itself out of a problem, you can open up the repo in cursor and get the cursor agent to fix it

## **3\. Cursor Composer vs Agent**

**Decision:** Use cursor agent

**Options Considered:**

* Cursor Composer  
* Cursor Agent

Reason:

* Cursor Composer is a one-shot approach to solving any problem  
* Cursor Agent takes an agentic approach to solving a problem

## **4\. Code Organization Strategy**

**Decision**: Prioritize AI-optimized code organization over traditional human-centric patterns. Don’t keep trying to refactor the code for human readability. 

**Options Considered**:

* Traditional clean code architecture  
* Strict frontend/backend separation  
* AI-optimized organization

**Reason**:

* AI agents, not humans, primarily maintain code  
* Traditional separation of concerns may hinder AI performance (disconnected context)  
* Lots of code in a single file is good for AI and terrible for humans.  
* Benefits include:  
  * More efficient context handling for AI  
  * Standardized hooks and function calls  
  * Seamless flow of business logic across frontend and backend  
  * Faster development and maintenance cycles

## **5\. Multi-Frontend Architecture**

**Decision**: When you need multiple small UIs with a single backend, use a centralized edge function repository.

**Options Considered**:

* Distributed edge functions across repos  
* Centralized edge function repository \- MonoRepo  
* Hybrid distribution

**Reason**:

* Prevents logic conflicts across multiple frontends  
* Maintains a single source of truth for business logic  
* Reduces risk of overwriting logic across repositories  
* Simplifies maintenance and updates  
* Allows other repos to focus on frontend-specific code  
* Switching to Monorepo will prevent the use of Lovable, but Cursor will do well.

## **6\. Source control** 

**Decision:** Use GitHub

**Options Considered:**

* Github  
* Gitlab  
* Other Git providers

**Reasons:**

* GitHub has native support in both Cursor and Lovable  
* Extensive support across development tools and CI/CD systems

## **7\. CI/CD**

**Decision:** Use AWS Amplify 2.0 as the deployment platform

**Options Considered:**

* Amplify 2.0  
* S3 \+ Cloudfront  
* Vercel


**Reason:**

* S3 \+ CloudFront is too low-level to deal with  
* This is a close call between Vercel and Amplify 2.0.   
* Both are two-click integrations with GitHub, and the deployments are fast and simple  
* Amplify has a slight edge over Vercel, given its Route53 integration that makes it easy to set up custom domains. Vercel isn’t much more complex, but you must log into two different systems.

## 8\. Framework Selection

**Decision:**  
While we recommend using LangChain as a teaching tool and for implementing your agent framework, it is not a requirement for this project. You are free to choose the framework or tools that best suit your preferences and project needs.

**Options Considered:**

* LangChain  
* LlamaIndex  
* Custom Frameworks (e.g., Python’s asyncio or FastAPI)  
* Cloud Platforms (e.g., AWS SageMaker, Azure AI, Google Cloud AI)

**Reason:**  
LangChain is recommended because it:

* Offers pre-built integrations for LLMs, RAG workflows, and workflow chaining.  
* Features a modular design that simplifies experimentation with different agent architectures.  
* Provides extensive documentation and community support, making it a great starting point for learning agent frameworks.

Alternative frameworks can also be effective, depending on your goals:

* LlamaIndex: Focused on retrieval-augmented generation workflows and data-centric operations.  
* Custom Frameworks: Provide maximum control, leveraging libraries like Python’s asyncio or web frameworks like FastAPI.  
* Cloud Platforms: Offer scalable and pre-built orchestration tools, such as AWS SageMaker or Azure AI, for agent workflows.

**Resources:**

* [https://x.com/kregenrek/status/1879230971171733944](https://x.com/kregenrek/status/1879230971171733944)  
* [https://x.com/nutlope/status/1879587920744788172](https://x.com/nutlope/status/1879587920744788172)

## 9\. Hosting Your Agent with Supabase Edge Functions

**Decision:**  
We recommend hosting your agent using Supabase Edge Functions due to their simplicity, scalability, and integration with Supabase's database and authentication features. However, you are free to choose other hosting platforms or frameworks based on your project requirements and familiarity.

**Options Considered:**

* Supabase Edge Functions  
* AWS Lambda  
* Google Cloud Functions  
* Custom Hosting Solutions (e.g., Docker \+ FastAPI on VPS)

**Reason:**  
Supabase Edge Functions are recommended because they:

* Are built on Deno, enabling fast, secure, and efficient serverless function execution in JavaScript or TypeScript.  
* Provide seamless integration with Supabase's database, storage, and authentication, simplifying agent workflows.  
* Offer a developer-friendly environment with support for local testing, straightforward deployment, and real-time updates.

Python-based alternatives may also be effective, depending on your requirements:

* **AWS Lambda**: A serverless compute service supporting Python, with robust scalability and integration with other AWS services for building event-driven architectures.  
* **Google Cloud Functions**: Provides Python runtime with easy integration into Google Cloud services, ideal for projects already leveraging the GCP ecosystem.  
* **Custom Hosting Solutions**: Building a custom setup using Docker and frameworks like FastAPI gives you maximum control over the environment and deployment, albeit with added complexity.

***Please Note: If your LangChain agent becomes too large for Supabase, we recommend using Amplify Cloud Functions.***

# Test2Pass (T2P) requirements

### Brainlift 

You must submit a Brainlift that highlights any SpikyPOVs that guided you in choosing AI features for your CRM.

### Walkthrough Video

You must screen share and walkthrough your application in a 3-5 min video. The video must showcase your AI features functioning and highlight how you went about setting up evaluations for these features on LangSmith/LangFuse. 

### GitHub Repository

You must submit the repository with the code associated with your project submission. 

### Deployed Application

You must submit a link to the deployed application, where graders can login and try out your AI features. 

### Agent Accuracy Metrics

To pass Week 2, you **must track any 2 of the following metrics** and showcase your evaluation process on LangSmith/LangFuse in your walkthrough video: 

* Success rate at identifying the correct action  
* Accuracy of field updates  
* Speed of response  
* Error rates and types

If for any reason, you need to use a custom metric that better matches your AI features, feel free to. If you are unsure on what that custom metric might be, reach out to staff for assistance. 

#### How to approach manual evaluation in your AI CRM applications for any accuracy-related metric: 

1. Document 20-30 common requests you'd actually make to your CRM system. Make sure to include both simple tasks ("update this grade") and complex ones ("draft a progress report based on the last three assessments").  
2. For each request in your test dataset, document the expected outcome.   
   1. What exact changes should appear in the database?  
   2. Which fields should be modified?  
   3. What should the response look like?  
   4. Any specific formatting or content requirements?  
3. Create structured test cases:  
   1. Input: The user's request  
   2. Expected Output: The specific changes that should occur  
   3. Context: Any additional information needed  
   4. Success Criteria: How to determine if the action was correct, probably human-driven for this project  
4. Set up LangSmith/LangFuse for monitoring:  
   1. Create a new project for your CRM features  
   2. Set up traces to track each request  
   3. Enable detailed logging of inputs/outputs  
5. Manually run systematic tests:  
   1. Test each case multiple times  
   2. Vary the phrasing slightly  
   3. Test with different contexts  
   4. Document any failures or unexpected behaviors  
6. Track key metrics manually:  
   1. Success rate at identifying the correct action  
   2. Accuracy of field updates  
   3. Speed of response  
   4. Error rates and types

# AI Tools and Resources

You’ll need to dive into agents, tools, and data models:

* [Build an Agent | 🦜️🔗 LangChain](https://python.langchain.com/docs/tutorials/agents/) \- tutorial for building your first LLM agent  
* [Tools Concepts | 🦜️🔗 LangChain](https://python.langchain.com/docs/concepts/tools/) \- conceptual guide to LLM tools  
* [Tools Integrations | 🦜️🔗 LangChain](https://python.langchain.com/docs/integrations/tools/) \- list of existing tools to potentially integrate

The data modeling (e.g. schema and migrations for tickets and other db entities) is not specific to AI \- but again it is worth taking time to understand and plan. You can refer to open-source implementations such as [FreeScout](https://freescout.net/) to draw inspiration and design ideas.

Additionally, here are resources on Zendesk and CRMs in general, to help you plan:

* [Zendesk Tutorials \- YouTube](https://www.youtube.com/playlist?list=PLb00xo9zloI6Uk8l3lAEhqcENqskrnoRs)  
* [COMPLETE Zendesk Tutorial For Beginners 2021 - How To Use Zendesk Customer Software](https://www.youtube.com/watch?v=MdDPi4BSPVc)  
* [Zendesk Tutorial: Customer Service Software & Sales CRM](https://www.youtube.com/watch?v=6GZ9_JNz6DU)

# Scope and deliverables

| Deliverable | Description |
| :---- | :---- |
| CRM app | Working CRM app that enables, at minimum, ticket filing, management, and response, with three types of users (customers, workers, admins) |
| AI augmentation \- baseline | CRM app automatically routes and resolves tickets that do not require human interaction |
| AI augmentation \- stretch | AI experience is more refined \- self-service, multimodal, admin summary, learning system, or come up with your own idea\! |

# Milestones

| Completion date | Project phase | Description |
| :---- | :---- | :---- |
| Jan 21, 2025 | CRM app MVP | You should have a working CRM app with at least ticket entities and creation |
| Jan 22, 2025 | Check in 1 |  |
| Jan 24, 2025 | App complete | On Friday you should have completed your app. |
| Jan 27, 2025 | AI Objectives start |  |
| Jan 29, 2025 | Check in 2 |  |
| Jan 31, 2025 | AI features complete | On Friday you should have completed the AI objectives |
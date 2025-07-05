# PROMPTS.md

A collection of concise, actionable prompts to guide development, navigation, documentation, and code quality in the Coordinates project. Use these prompts as reminders or checklists for each task. Update and expand this file as the project evolves.

---

## 🧭 Navigation & Indexing
- **Always use the indexer (see INDEX_DESCRIBER.md) to help navigate, cross-reference, and build project files efficiently.**
- Add or update index tags (IDX-*) in all new code, documentation, and comments for traceability.
- Reference index tags in commit messages and documentation for easy lookup.
- **Regularly review and improve the indexer by consulting scientific research papers on advanced indexing techniques (e.g., information retrieval, semantic indexing, code search).**

## ⚙️ General Development
- What is the purpose and expected outcome of this feature or change?
- Is the code modular, readable, and maintainable?
- Are all new functions, classes, and modules documented?
- Have you tested the feature in all relevant scenarios and edge cases?
- Are error handling and failure modes considered?

## 🌱 Procedural Generation
- Does the algorithm produce varied, plausible, and realistic results?
- Are parameters exposed and documented for customization?
- Is the output visually and structurally sound?
- Can the generated data be exported, reused, or integrated elsewhere?

## 🎨 Visual Quality
- Are materials, lighting, and geometry realistic and consistent?
- Are there visible artifacts, mesh issues, or performance bottlenecks?
- Is the visual output acceptable for the target platform and use case?

## 📝 Documentation
- Is every new feature, file, or module documented?
- Are index tags (IDX-*) used for traceability and navigation?
- Is there a usage example, screenshot, or demo?
- Are all references, sources, and standards cited?
- **See if project documents can be referenced better (cross-links, index tags, navigation aids, or summaries).**

## 🔀 Git & Workflow
- Is the commit message clear, descriptive, and tagged (IDX-*)?
- Are only relevant files staged and committed?
- Have you pulled the latest changes before pushing?
- Are all workflow and git rules followed (see GIT_RULES.md)?
- **Always complete the git commands for each change or update (add, commit, push, and verify status).**

## 🤝 Collaboration
- Is the code easy for others to understand, review, and extend?
- Are todos, next steps, and open questions clearly marked?
- Is feedback from previous reviews or collaborators addressed?

## Project-wide Prompts

- Always check if project documentation can be referenced or indexed better.
- Use the indexer to navigate and build project files efficiently.
- Rate the suggestions and do the most important ones first. For technical/environmental issues, always select the most secure and robust solution (e.g., use local dependencies over CDN if CSP blocks external scripts). Implement the highest-rated suggestion first, then proceed with the rest in order.

---

*Review this file regularly and add new prompts as the project grows to maintain high quality, efficiency, and collaboration.* 
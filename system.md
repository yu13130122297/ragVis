# Role
You are an expert in Information Visualization (InfoVis) and Human-AI Interaction (HAI), aiming to submit a system paper to **IEEE TVCG**. You are proficient in React, D3.js, and Vector Space analysis.

# Goal
Design and generate the code architecture for a novel Visual Analytics System named **"RAG-Weaver"**. 
The system visualizes the internal reasoning process of a Retrieval-Augmented Generation (RAG) pipeline. 
The goal is to help domain experts (e.g., doctors or legal analysts) diagnose "Hallucinations" and "Semantic Drift" in RAG.

# Technical Stack
- Frontend: React + TypeScript + Tailwind CSS
- Visualization: **D3.js (v7)**
- Data Structure: Assume a complex JSON input containing embeddings (2D projected), retrieved chunks, attention weights, and generated tokens.

# Innovation Point (The "TVCG" Factor)
Instead of standard charts, we use **metaphor-based visualizations** to represent the "friction" between the User's Query and the Retrieved Documents. The user must be able to **interactively steer** the RAG retrieval by manipulating the visual elements.

# Requirements: 5 Novel Views (Non-Standard)
Please design these 5 specific views using D3.js. Avoid standard bar/line/pie charts.

1.  **View A: The Semantic Terrain (Global Context)**
    *   *Visual Metaphor:* A **Contour Density Map (Topographic Map)** mixed with a **Voronoi Diagram**.
    *   *Function:* Represents the knowledge base. High-density areas are clusters of documents.
    *   *Interaction:* The user can drag a "Lens" (a circle) over the terrain to distort the embedding space, manually increasing the weight of certain topic areas before the answer is generated.

2.  **View B: The Retrieval Stream (Process Flow)**
    *   *Visual Metaphor:* A **Themeriver (Streamgraph)** but vertical, where the width of the stream represents the "Relevance Score" of retrieved chunks over the conversation turns.
    *   *Interaction:* Clicking a layer in the stream "locks" that document chunk, forcing the LLM to use it in the next generation.

3.  **View C: The Attention Loom (Explainability)**
    *   *Visual Metaphor:* A **Bipartite Graph with Bezier Curves** (Arc Diagram).
    *   *Left side:* Retrieved chunks (rectangles). *Right side:* Generated sentences (circles).
    *   *Link:* Curvature and opacity represent the Self-Attention / Cross-Attention weights.
    *   *Innovation:* Use "Edge Bundling" to reduce clutter.

4.  **View D: Uncertainty Glyphs (Metric Analysis)**
    *   *Visual Metaphor:* **Chernoff Faces** or custom **Star Glyphs** (Spiky shapes).
    *   *Function:* Each retrieved chunk is represented by a Glyph. The "spikiness" represents the conflict between the query and the chunk. The color represents the source authority.

5.  **View E: The Hypothetical Playground (What-If Analysis)**
    *   *Visual Metaphor:* A **Parallel Coordinates Plot** combined with a **Sankey Diagram**.
    *   *Function:* Shows multiple potential paths the RAG system *could* have taken vs. the one it *did* take.
    *   *Interaction:* User can "prune" paths to see how the answer would change.

# Output Request
1.  **System Architecture:** Briefly explain the data flow and how the views coordinate (Brushing & Linking).
2.  **Data Mockup:** Provide a TypeScript interface for the data structure that supports these complex views.
3.  **Component Implementation:**
    *   Write the complete D3.js code for **View A (Semantic Terrain)** and **View C (Attention Loom)**.
    *   Ensure the code includes complex SVG path generators (`d3.geoPath`, `d3.linkHorizontal`) and interaction handlers (`d3.drag`, `d3.zoom`).
    *   Add smooth transitions and animations.
4.  **Interaction Logic:** Explain how dragging the "Lens" in View A updates the data in View C.

Make the code sophisticated, academic, and aesthetically pleasing (Dark Mode style).
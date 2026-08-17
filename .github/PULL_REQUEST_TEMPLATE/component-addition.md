## 🧱 New Component / Block / Template

<!-- Briefly describe the component, its use case, and any design inspiration. -->

---

## 🛑 The Satisium UI Registry Checklist

<!-- This is the master checklist. Missing a step will break the CLI or Docs. -->

### 1. Media & Previews 🖼️

- [ ] **Thumbnail Image:** Added a high-quality static thumbnail for the component card grid.
- [ ] **Video Preview:** Added a seamless looping MP4/GIF to showcase the animation/interaction.

### 2. Documentation (`content/docs/...`) 📝

- [ ] **Copy MDX:** Created the separate corresponding MDX file for the "Click to Copy" functionality.
- [ ] **CLI Installation:** The `npx shadcn add ...` command is prominently displayed and tested.
- [ ] **Manual Installation:** All dependencies are listed, and source code (along with related files/folders) is fully displayed.
- [ ] **Props API:** A detailed prop documentation table is written.
- [ ] **Credits:** Proper attribution given to folks/designs that inspired this component.

### 3. Demos & Implementations 🎮

- [ ] **Demo Files Added:** Proper demo variations (`demo-one.tsx`, `demo-two.tsx`) created in `registry/demos/`.
- [ ] **Video and image Previews:** Added demo video and image previews to cloudinary and linked that to the mdx frontmatter.
- [ ] **Code Strings:** Raw code strings export properly for the docs to read.
- [ ] **Demo CLI Command:** The proper CLI command to install the _demo_ specifically is displayed.
- [ ] **Preview Toolbar:** The demo viewer has working buttons for: `Copy Code`, `Open Isolated View`, and `View on GitHub`.

### 4. The JSON Registry & Engine ⚙️

- [ ] Ran `pnpm registry:public`.
- [ ] Verified `public/r/` JSON files correctly map source code, dependencies, and demo paths.
- [ ] Ran `pnpm llm` and verified `llms.txt` and `public/llms/` are updated.

---

## Visual Proof

<!-- Drop the video preview or GIF here. -->

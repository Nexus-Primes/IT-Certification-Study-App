(function () {
  'use strict';
  window.BLENDER_FUNDAMENTALS_LABS = [
  {
    "id": "orientation-visual",
    "core": "core1",
    "domain": "bf1",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Get oriented in the Blender viewport",
    "summary": "A visual, click-by-click walkthrough of orbiting, snapping to a straight view, and finding your way around the interface.",
    "brief": "Before touching any modeling tools, get comfortable moving around the viewport and knowing where the main panels live. Each step shows a diagram of where the action happens.",
    "steps": [
      { "instruction": "Orbit the view. Click and drag with the middle mouse button anywhere in the viewport to rotate freely around the object.", "zone": "viewport", "note": "Middle-drag to orbit", "shape": "cube", "shapeNote": "Default cube" },
      { "instruction": "Snap to a straight-on Front view. Press Numpad 1 to jump the camera instantly, instead of orbiting by eye.", "zone": "viewport", "note": "Numpad 1 = Front view", "shape": "cube", "shapeNote": "Now viewed from directly in front" },
      { "instruction": "Open the transform sidebar. With your cursor over the viewport, press N to reveal the panel showing Location, Rotation, and Scale.", "zone": "viewport-right", "note": "Press N here", "shape": "cube", "shapeNote": "N-panel slides in from the right" },
      { "instruction": "Find your object in the Outliner. It lists every object, collection, and data-block in the scene — click a name there to select that object.", "zone": "outliner", "note": "Object list", "shape": "cube" },
      { "instruction": "Open the Properties panel and click the wrench icon to view the Modifier tab, where non-destructive effects like Subdivision Surface get added later.", "zone": "properties", "note": "Wrench = Modifiers", "shape": "cube", "propTab": "modifier" }
    ],
    "explanation": "Orbiting, snapping to standard views, and knowing where the N-panel, Outliner, and Properties panel live are the basic navigation skills every other Blender workflow builds on — none of the modeling, shading, or animation labs make sense until moving around the interface feels automatic."
  },
  {
    "id": "workspace-layout-visual",
    "core": "core1",
    "domain": "bf1",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 7,
    "title": "Split, join, and resize interface areas",
    "summary": "A visual walkthrough of reshaping Blender's layout instead of working around whatever the default gives you.",
    "brief": "Every area in Blender's interface can be resized, split, retyped, or joined back together. Walk through reshaping the layout to fit a task instead of fighting the default one.",
    "steps": [
      { "instruction": "Hover over the border between two areas — such as the viewport and the Timeline — until the cursor changes, then drag to resize.", "zone": "timeline", "note": "Drag border to resize", "shape": "cube" },
      { "instruction": "Drag from the small triangle in an area's corner to split it into two independent panels.", "zone": "viewport", "note": "Corner-drag = Split Area", "shape": "cube" },
      { "instruction": "Click the editor-type dropdown in a panel's corner and switch it to a different editor, such as the Shader Editor.", "zone": "header", "note": "Editor type dropdown", "shape": "cube" },
      { "instruction": "Drag one area's border over another and release to Join Areas, merging them back into one.", "zone": "viewport", "note": "Drag to Join Areas", "shape": "cube" },
      { "instruction": "Click the Workspace tabs at the very top of the window — Layout, Modeling, Shading — to jump between Blender's built-in preset layouts.", "zone": "header", "note": "Workspace tabs", "shape": "cube" }
    ],
    "explanation": "Blender's default layout is just a starting point — knowing how to split, resize, retype, and switch between areas means you can build the exact workspace a specific task calls for instead of working around the default one."
  },
  {
    "id": "shading-modes-visual",
    "core": "core1",
    "domain": "bf1",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 8,
    "title": "Switch shading modes and isolate objects with Local View",
    "summary": "A visual walkthrough of Wireframe, Solid, and Material Preview shading, plus isolating a single object with Local View.",
    "brief": "A cluttered scene or a hidden shape problem is often easier to diagnose by changing how the viewport displays it, not by changing the model itself.",
    "steps": [
      { "instruction": "Use the four shading icons in the top-right of the viewport header to switch between Wireframe, Solid, Material Preview, and Rendered.", "zone": "header", "note": "Shading mode icons", "shape": "wireframe-cube" },
      { "instruction": "Press Z anywhere in the viewport to open the shading pie menu — a faster way to jump straight to Wireframe without hunting for the icons.", "zone": "viewport", "note": "Z = shading pie", "shape": "wireframe-cube" },
      { "instruction": "Select a single object and press Numpad / (slash) to enter Local View, hiding everything else in the scene so only it is visible.", "zone": "viewport", "note": "Numpad / = Local View", "shape": "cube" },
      { "instruction": "Press Numpad / again to leave Local View and bring the rest of the scene back.", "zone": "viewport", "note": "Numpad / to exit", "shape": "cube" },
      { "instruction": "Press Alt+H to unhide anything that was individually hidden with H, so nothing stays missing by accident.", "zone": "outliner", "note": "Alt+H unhides all", "shape": "cube" }
    ],
    "explanation": "Wireframe, Solid, and Material Preview each answer a different question about a model, and Local View strips away every other object in the scene so a single one can be judged without visual clutter — both are constant background habits in real modeling sessions, not one-off tricks."
  },
  {
    "id": "custom-workspace-visual",
    "core": "core1",
    "domain": "bf1",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 9,
    "title": "Build a custom workspace tab and save it as your default",
    "summary": "A visual walkthrough of creating a personal workspace layout and making it load automatically every time Blender starts.",
    "brief": "The built-in workspace tabs are a starting point, not a requirement. Walk through building a layout tailored to how you actually work and saving it as the default.",
    "steps": [
      { "instruction": "Click the + tab at the end of the Workspace tab row and duplicate an existing workspace, like Layout, to start from a familiar setup.", "zone": "header", "note": "+ to add workspace", "shape": "cube" },
      { "instruction": "Double-click the new tab's label to rename it, then split and resize its areas into the arrangement you actually work in.", "zone": "header", "note": "Double-click to rename", "shape": "cube" },
      { "instruction": "Drag commonly used tools into the Quick Favorites menu, opened with Q, so they're one keypress away regardless of which panel is open.", "zone": "toolbar", "note": "Q = Quick Favorites", "shape": "cube" },
      { "instruction": "Open File > Defaults > Save Startup File to make this exact workspace arrangement load automatically every time Blender starts.", "zone": "header", "note": "Save Startup File", "shape": "cube" },
      { "instruction": "Restart Blender, or use File > New > General, and confirm the custom tab is already there without having to rebuild it.", "zone": "header", "note": "Verify on restart", "shape": "cube" }
    ],
    "explanation": "A workspace tailored to how you actually work, saved as the default startup file, removes the repeated setup cost of rebuilding the same layout every single session."
  },
  {
    "id": "transform-precision-visual",
    "core": "core1",
    "domain": "bf2",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Move, rotate, and scale with precision",
    "summary": "A visual walkthrough of grabbing an object, constraining a move to one axis, and setting an exact value.",
    "brief": "Dragging an object by eye is imprecise. Walk through moving an object exactly where you want it using axis locks and numeric input.",
    "steps": [
      { "instruction": "Select the object. Left-click it once in the viewport — it should show a highlighted outline.", "zone": "viewport", "note": "Left-click to select", "shape": "cube" },
      { "instruction": "Grab and move it freely. Press G, then move your mouse, then left-click to confirm the new position.", "zone": "viewport", "note": "G = Grab", "shape": "cube" },
      { "instruction": "Constrain the move to one axis. Press G, then Z, then type the number 2, then press Enter — this moves the object exactly 2 units straight up.", "zone": "viewport", "note": "G, Z, 2, Enter", "shape": "cube-up", "shapeNote": "Moved exactly 2 units on Z" },
      { "instruction": "Confirm it in the N-panel. Open the sidebar and check that the Location Z value updated to match what you typed.", "zone": "viewport-right", "note": "Check Location Z", "shape": "cube-up" },
      { "instruction": "Change the rotation pivot. In the header dropdown, switch from Median Point to 3D Cursor so future rotations happen around the cursor instead of the object's own center.", "zone": "header", "note": "Pivot point dropdown", "shape": "cube-up" }
    ],
    "explanation": "Free-hand grabbing is fine for rough placement, but axis-locking plus numeric input is how precise, repeatable moves actually get done — and knowing where the pivot point setting lives matters the moment a rotation needs to happen around something other than the object's own center."
  },
  {
    "id": "snap-cursor-visual",
    "core": "core1",
    "domain": "bf2",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Use the 3D cursor and Snap to place objects exactly",
    "summary": "A visual walkthrough of repositioning the 3D cursor and snapping objects onto exact points instead of eyeballing it.",
    "brief": "New objects spawn wherever the 3D cursor sits, and Snapping locks a move onto exact geometry. Walk through both together to place something precisely.",
    "steps": [
      { "instruction": "Shift+Right-click anywhere in the viewport to move the 3D cursor to that exact point — new objects will be created there.", "zone": "viewport", "note": "Shift+Right-click", "shape": "cursor-mark" },
      { "instruction": "Press Shift+C to reset the 3D cursor back to the world origin.", "zone": "viewport", "note": "Shift+C = reset cursor", "shape": "cursor-mark" },
      { "instruction": "With an object selected, press Shift+S to open the Snap pie menu and choose Selection to Cursor.", "zone": "viewport", "note": "Shift+S pie menu", "shape": "cursor-mark" },
      { "instruction": "Turn on Snapping using the magnet icon in the header and set its target to Vertex, so future moves snap onto another object's geometry.", "zone": "header", "note": "Magnet icon = snapping", "shape": "cube" },
      { "instruction": "Confirm the object's new position in the N-panel's Location fields.", "zone": "viewport-right", "note": "Check Location", "shape": "cube" }
    ],
    "explanation": "The 3D cursor controls where new objects spawn, and Snapping controls how existing objects lock onto exact points — together they're how objects get placed exactly instead of being eyeballed into approximately the right spot."
  },
  {
    "id": "parent-collections-visual",
    "core": "core1",
    "domain": "bf2",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 8,
    "title": "Parent objects and organize them into collections",
    "summary": "A visual walkthrough of making one object follow another, and grouping related objects into a named collection.",
    "brief": "A scene with a dozen loose objects gets unmanageable fast. Walk through parenting objects so they move together, and grouping them into collections.",
    "steps": [
      { "instruction": "Select the child object first, then Shift-click the parent object last, so the parent is the active selection.", "zone": "outliner", "note": "Child first, parent last", "shape": "cube-parent" },
      { "instruction": "Press Ctrl+P and choose Object (Keep Transform) to parent them without the child jumping to a new position.", "zone": "viewport", "note": "Ctrl+P = parent", "shape": "cube-parent" },
      { "instruction": "Move the parent object and confirm the child follows it automatically.", "zone": "viewport", "note": "Parent moves, child follows", "shape": "cube-parent" },
      { "instruction": "In the Outliner, right-click and choose New Collection, then drag related objects into it to keep the scene organized.", "zone": "outliner", "note": "New Collection", "shape": "cube-collection" },
      { "instruction": "Rename the collection to something descriptive, so it's easy to find and hide as a group later.", "zone": "outliner", "note": "Rename collection", "shape": "cube-collection" }
    ],
    "explanation": "Parenting keeps related objects moving together as a scene grows, and collections keep the Outliner organized enough to find and hide groups of objects at once instead of hunting through a flat list."
  },
  {
    "id": "pivot-orientation-visual",
    "core": "core1",
    "domain": "bf2",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 9,
    "title": "Set a custom transform pivot and orientation for an angled part",
    "summary": "A visual walkthrough of creating a custom transform orientation so a rotation follows an angled face instead of the world axis.",
    "brief": "Global orientation works until a part sits at an angle. Walk through creating a custom orientation and pivot so transforms follow the part's own geometry.",
    "steps": [
      { "instruction": "In Edit Mode, select a single face on the angled part, then open Transform Orientations and choose Create so a new orientation is built from that face's normal.", "zone": "header", "note": "Create orientation", "shape": "cube-rotate" },
      { "instruction": "Switch the active Transform Orientation dropdown to the new custom orientation instead of Global.", "zone": "header", "note": "Custom orientation", "shape": "cube-rotate" },
      { "instruction": "Change the Pivot Point dropdown from Median Point to Individual Origins or 3D Cursor, depending on what the rotation should happen around.", "zone": "header", "note": "Pivot point dropdown", "shape": "cube-rotate" },
      { "instruction": "Rotate the part with R — it now rotates around the angled face's own axis instead of the world axis.", "zone": "viewport", "note": "R rotates on custom axis", "shape": "cube-rotate" },
      { "instruction": "Switch back to Global orientation and Median Point pivot once the adjustment is done, so later transforms behave normally again.", "zone": "header", "note": "Reset to Global", "shape": "cube" }
    ],
    "explanation": "Global orientation and Median Point work for most transforms, but an angled part needs its own local axis to rotate or scale correctly — without a custom orientation and pivot, the transform happens around the wrong point entirely."
  },
  {
    "id": "basic-mug-visual",
    "core": "core1",
    "domain": "bf3",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Build a simple mug using core modeling tools",
    "summary": "A visual walkthrough of turning a cylinder into a basic mug with a handle using Edit Mode's core tools.",
    "brief": "Starting from a default cylinder mesh, walk through shaping it into a simple mug with a handle using the same tools every model starts with.",
    "steps": [
      { "instruction": "Press Shift+A, choose Mesh > Cylinder, and adjust its vertex count and size in the operator panel in the bottom-left corner.", "zone": "viewport", "note": "Shift+A > Cylinder", "shape": "cube" },
      { "instruction": "Press Tab to enter Edit Mode, switch to Face Select, and click the top face to select it.", "zone": "viewport", "note": "Tab = Edit Mode", "shape": "cube" },
      { "instruction": "Press I to Inset the face, then E to Extrude it downward, hollowing out the inside of the mug.", "zone": "viewport", "note": "I inset, E extrude", "shape": "cube-up" },
      { "instruction": "Alt+click the outer edge loop at the rim to select it, then press Ctrl+B to add a Bevel for a finished edge.", "zone": "viewport", "note": "Ctrl+B = Bevel", "shape": "cube" },
      { "instruction": "Select a small patch on the side, extrude it outward and loop it around into a handle, then press Tab to return to Object Mode.", "zone": "viewport", "note": "Extrude handle, exit Edit Mode", "shape": "cube" }
    ],
    "explanation": "The base shape has to exist before it can be edited, hollowing the inside only makes sense once you're in Edit Mode on the right face, and the bevel and handle are refinements that build on that hollowed shape rather than steps that could happen first."
  },
  {
    "id": "bracket-extrude-bevel-visual",
    "core": "core1",
    "domain": "bf3",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Extrude and bevel a simple bracket shape",
    "summary": "A visual walkthrough of shaping an L-bracket with extrude and bevel, then cutting a bolt hole with a Boolean.",
    "brief": "A basic L-bracket exercises extrude, bevel, and a non-destructive Boolean cut — the core toolkit behind most hard-surface modeling.",
    "steps": [
      { "instruction": "Start from a Cube, enter Edit Mode, and select the top face to begin shaping an L-bracket.", "zone": "viewport", "note": "Select top face", "shape": "cube" },
      { "instruction": "Extrude that face upward with E, then scale it down on one axis with S to form the bracket's vertical arm.", "zone": "viewport", "note": "E, then S to scale", "shape": "bracket" },
      { "instruction": "Select the sharp outer corner edge and apply a Bevel with two or three segments for a rounded edge instead of a razor-sharp one.", "zone": "viewport", "note": "Bevel the corner", "shape": "bracket" },
      { "instruction": "Add a small cylinder where a bolt hole belongs, then add a Boolean modifier set to Difference to cut the hole through the bracket.", "zone": "properties", "note": "Boolean modifier", "shape": "bracket", "propTab": "modifier" },
      { "instruction": "Apply the Boolean modifier once the hole looks correct, then rotate around the bracket in Solid shading to check the result.", "zone": "viewport", "note": "Apply modifier", "shape": "bracket" }
    ],
    "explanation": "Extrude builds the bracket's core silhouette, a bevel keeps sharp edges from looking unrealistically knife-thin, and a Boolean cut is the standard non-destructive way to add a hole without manually deleting and rebuilding geometry."
  },
  {
    "id": "mirror-modifier-visual",
    "core": "core1",
    "domain": "bf3",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Use the Mirror modifier to model half and get a symmetric result",
    "summary": "A visual walkthrough of modeling only one side of a symmetric object and letting the Mirror modifier build the rest.",
    "brief": "Most symmetric objects only need one half modeled by hand. Walk through setting up a Mirror modifier so the other half stays perfectly in sync.",
    "steps": [
      { "instruction": "In Edit Mode, delete half of the base mesh along the X axis, keeping only one symmetric side to work on.", "zone": "viewport", "note": "Delete half the mesh", "shape": "cube-mirror" },
      { "instruction": "In the Properties panel's wrench (Modifier) tab, add a Mirror modifier and confirm the axis matches the side you kept.", "zone": "properties", "note": "Add Mirror modifier", "shape": "cube-mirror", "propTab": "modifier" },
      { "instruction": "Turn on Clipping in the modifier settings so vertices on the center line merge cleanly instead of leaving a visible seam.", "zone": "properties", "note": "Enable Clipping", "shape": "cube-mirror", "propTab": "modifier" },
      { "instruction": "Model details — extrusions, bevels, insets — on just the one half, and watch them mirror live on the other side.", "zone": "viewport", "note": "Edit one side only", "shape": "cube-mirror" },
      { "instruction": "Once finished, apply the Mirror modifier to bake both halves into a single real mesh before exporting or adding more modifiers on top.", "zone": "properties", "note": "Apply when done", "shape": "cube-mirror", "propTab": "modifier" }
    ],
    "explanation": "Modeling only half a symmetric object and mirroring the rest halves the work and guarantees perfect symmetry — something manual modeling on both sides can't reliably promise."
  },
  {
    "id": "array-bevel-railing-visual",
    "core": "core1",
    "domain": "bf3",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 10,
    "title": "Combine Array and Bevel modifiers to build a railing segment",
    "summary": "A visual walkthrough of stacking Array and Bevel modifiers to repeat one modeled post into a finished railing.",
    "brief": "One modeled railing post, repeated with an Array modifier and finished with a Bevel modifier, is far faster and more editable than modeling every post by hand.",
    "steps": [
      { "instruction": "Model a single railing post as a simple beveled cube, and set its origin to one edge so it repeats in a straight line.", "zone": "viewport", "note": "Set origin to edge", "shape": "cube-array" },
      { "instruction": "Add an Array modifier in the Modifier tab and set the Count to however many posts the railing needs.", "zone": "properties", "note": "Array modifier, set Count", "shape": "cube-array", "propTab": "modifier" },
      { "instruction": "Adjust the Relative Offset X/Y/Z values until the spacing between repeated posts looks even, not overlapping or too far apart.", "zone": "properties", "note": "Adjust offset spacing", "shape": "cube-array", "propTab": "modifier" },
      { "instruction": "Add a Bevel modifier above the Array modifier in the stack so every repeated post gets rounded edges automatically.", "zone": "properties", "note": "Bevel modifier on top", "shape": "cube-array", "propTab": "modifier" },
      { "instruction": "Reorder the modifiers if the result looks wrong — modifier order changes the outcome, and Bevel usually belongs after Array.", "zone": "properties", "note": "Check modifier order", "shape": "cube-array", "propTab": "modifier" }
    ],
    "explanation": "Array turns one modeled post into a full repeated railing without manually duplicating it, and stacking a Bevel modifier above it means every repeat gets the same finished edge automatically — modifier order changes the result, which is why checking the stack matters."
  },
  {
    "id": "first-material-visual",
    "core": "core1",
    "domain": "bf4",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Apply your first material and base color",
    "summary": "A visual walkthrough of creating a material slot, setting a base color, and viewing it in Material Preview shading.",
    "brief": "Every object starts with no material at all. Walk through creating one, giving it a color, and actually seeing it in the viewport.",
    "steps": [
      { "instruction": "Select the object, then open the Properties panel's material tab, shown as a checkered sphere icon.", "zone": "properties", "note": "Sphere icon = Material", "shape": "cube", "propTab": "material" },
      { "instruction": "Click New to create a material slot and give it a descriptive name instead of leaving it as 'Material.001'.", "zone": "properties", "note": "New material, rename it", "shape": "material-cube", "propTab": "material" },
      { "instruction": "Click the Base Color swatch in the Principled BSDF settings and choose a color from the picker.", "zone": "properties", "note": "Base Color swatch", "shape": "material-cube", "propTab": "material" },
      { "instruction": "Raise or lower the Roughness value to control how shiny versus matte the surface looks.", "zone": "properties", "note": "Adjust Roughness", "shape": "material-cube", "propTab": "material" },
      { "instruction": "Switch the viewport to Material Preview shading — the checkered-sphere icon in the header — to actually see the color and shine.", "zone": "header", "note": "Material Preview shading", "shape": "material-cube" }
    ],
    "explanation": "Every other shading and texturing skill builds on top of a basic material slot and a base color, and none of it is visible until the viewport is actually switched into Material Preview or Rendered shading."
  },
  {
    "id": "texture-workflow-visual",
    "core": "core1",
    "domain": "bf4",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Get an image texture showing correctly on a model",
    "summary": "A visual walkthrough of unwrapping a mesh and wiring a downloaded image texture into its material.",
    "brief": "A simple mesh needs a downloaded image texture applied to it so it looks correct in the viewport and final render.",
    "steps": [
      { "instruction": "In Edit Mode, select the whole mesh and mark seams (Ctrl+E > Mark Seam) along edges where it should visually 'unfold'.", "zone": "viewport", "note": "Ctrl+E > Mark Seam", "shape": "texture-cube" },
      { "instruction": "Press U and choose Unwrap to generate the UV layout based on those seams.", "zone": "viewport", "note": "U = Unwrap", "shape": "texture-cube" },
      { "instruction": "Open the UV Editor and check the layout isn't badly stretched or overlapping before texturing.", "zone": "viewport-right", "note": "Check UV layout", "shape": "texture-cube" },
      { "instruction": "In the Shading workspace, add an Image Texture node, load the downloaded image, and connect its Color output to the Principled BSDF's Base Color input.", "zone": "properties", "note": "Wire texture to Base Color", "shape": "texture-cube", "propTab": "material" },
      { "instruction": "Switch to Material Preview or Rendered shading to confirm the image now actually appears correctly on the surface.", "zone": "header", "note": "Confirm in Rendered view", "shape": "texture-cube" }
    ],
    "explanation": "Seams and unwrapping have to exist before there's a UV layout to check, and wiring the image into Base Color is what actually makes it show up — none of it is visible until the viewport itself is switched to a shading mode that renders materials."
  },
  {
    "id": "mix-shader-visual",
    "core": "core1",
    "domain": "bf4",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Mix two materials using the Shader Editor",
    "summary": "A visual walkthrough of blending two Principled BSDF shaders with a Mix Shader node driven by a texture.",
    "brief": "Real-world surfaces are rarely one uniform material. Walk through blending two shaders together with a texture controlling where each one shows.",
    "steps": [
      { "instruction": "Open the Shading workspace tab so both the 3D viewport and the node-based Shader Editor are visible at once.", "zone": "header", "note": "Shading workspace tab", "shape": "shader-mix" },
      { "instruction": "Add two separate Principled BSDF nodes with different colors — for example a clean base color and a rusted metal color.", "zone": "properties", "note": "Two BSDF nodes", "shape": "shader-mix", "propTab": "material" },
      { "instruction": "Add a Mix Shader node, plug both BSDFs into its two shader inputs, and connect its result to the Material Output.", "zone": "properties", "note": "Mix Shader node", "shape": "shader-mix", "propTab": "material" },
      { "instruction": "Plug a texture — like a grunge or noise image — into the Mix Shader's Factor input so the blend follows a pattern instead of an even 50/50 split.", "zone": "properties", "note": "Texture drives the Factor", "shape": "shader-mix", "propTab": "material" },
      { "instruction": "Preview the blended result in Rendered shading and adjust the Factor texture's contrast until the transition looks natural.", "zone": "header", "note": "Check blend in Rendered view", "shape": "shader-mix" }
    ],
    "explanation": "A Mix Shader combined with a texture-driven Factor is how real materials — rust over metal, dirt over paint — actually get built, instead of relying on a single flat, uniform material."
  },
  {
    "id": "roughness-texture-visual",
    "core": "core1",
    "domain": "bf4",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 9,
    "title": "Drive roughness with a texture for a more realistic surface",
    "summary": "A visual walkthrough of connecting a grayscale roughness map to the Principled BSDF instead of using one flat value.",
    "brief": "A single flat Roughness value makes an entire surface uniformly shiny or matte. Walk through driving it from a texture instead for a more realistic result.",
    "steps": [
      { "instruction": "Load a grayscale roughness map as a second Image Texture node in the Shader Editor, separate from the color texture.", "zone": "properties", "note": "Second Image Texture node", "shape": "texture-cube", "propTab": "material" },
      { "instruction": "Set its Color Space to Non-Color, since roughness data isn't meant to be color-corrected like a photo.", "zone": "properties", "note": "Non-Color color space", "shape": "texture-cube", "propTab": "material" },
      { "instruction": "Connect the roughness texture's output directly into the Principled BSDF's Roughness input instead of a flat slider value.", "zone": "properties", "note": "Connect to Roughness input", "shape": "texture-cube", "propTab": "material" },
      { "instruction": "Compare the result in Rendered shading against a flat Roughness value — the textured version should show varied shine across the surface.", "zone": "header", "note": "Compare in Rendered view", "shape": "texture-cube" },
      { "instruction": "If the effect is too strong or weak, add a ColorRamp node between the texture and the Roughness input to remap its intensity.", "zone": "properties", "note": "ColorRamp to remap", "shape": "texture-cube", "propTab": "material" }
    ],
    "explanation": "Real-world surfaces aren't uniformly shiny or matte — driving Roughness from a texture instead of one flat slider value is what makes a material read as physically real instead of looking like plastic."
  },
  {
    "id": "first-light-camera-visual",
    "core": "core1",
    "domain": "bf5",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Add and aim your first light and camera",
    "summary": "A visual walkthrough of adding a point light, raising its power, and framing a shot with a camera.",
    "brief": "A scene needs at least one light and a camera before any render means anything. Walk through adding and aiming both.",
    "steps": [
      { "instruction": "Press Shift+A, choose Light > Point, and place it above the subject to start with the simplest light type.", "zone": "viewport", "note": "Shift+A > Light > Point", "shape": "light" },
      { "instruction": "Increase its Power in the light data properties — the small bulb icon — so the subject is actually visible, not just barely lit.", "zone": "properties", "note": "Bulb icon, raise Power", "shape": "light", "propTab": "light" },
      { "instruction": "Press Shift+A and choose Camera to add a camera, then position it in front of the subject.", "zone": "viewport", "note": "Shift+A > Camera", "shape": "camera-cube" },
      { "instruction": "Select the camera and press Ctrl+Numpad 0 to snap the viewport into that camera's exact view.", "zone": "viewport", "note": "Ctrl+Numpad 0 = camera view", "shape": "camera-cube" },
      { "instruction": "Nudge the camera with G and R while still in camera view until the subject is framed the way you want.", "zone": "viewport", "note": "G/R to frame the shot", "shape": "camera-cube" }
    ],
    "explanation": "A light and a camera are the two things a scene needs before render output means anything at all — without them, there's nothing to see and no vantage point to see it from."
  },
  {
    "id": "three-point-light-visual",
    "core": "core1",
    "domain": "bf5",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Set up a basic three-point light rig",
    "summary": "A visual walkthrough of adding a key light, a softer fill light, and previewing the result.",
    "brief": "A bare scene with no lighting renders flat and lifeless. Walk through adding a simple two-light setup that gives a subject real depth.",
    "steps": [
      { "instruction": "Add a key light. Press Shift+A in the viewport, choose Light, then Area, and place it above and to one side of the subject.", "zone": "viewport", "note": "Shift+A > Light > Area", "shape": "light", "shapeNote": "Key light added" },
      { "instruction": "Aim it at the subject. With the light selected, press R then an axis key to rotate it until it faces the object.", "zone": "viewport", "note": "R to rotate the light", "shape": "light" },
      { "instruction": "Add a second, softer fill light on the opposite side at lower intensity — this lifts the shadows the key light casts instead of leaving them pure black.", "zone": "viewport", "note": "Second Area light, lower Power", "shape": "light-two", "shapeNote": "Key + fill light" },
      { "instruction": "Adjust each light's strength in the Properties panel's light data tab, shown as a small bulb icon.", "zone": "properties", "note": "Bulb icon = Light data", "shape": "light-two", "propTab": "light" },
      { "instruction": "Preview the real result. Switch to Rendered viewport shading using the sphere icons in the top-right of the header.", "zone": "header", "note": "Rendered shading toggle", "shape": "light-two" }
    ],
    "explanation": "A single light produces harsh, flat shadows with no depth. Adding a dimmer fill light on the opposite side lifts those shadows without erasing them, which is the simplest version of the three-point lighting principle used in real photography and film — and switching to Rendered shading is the only way to actually judge whether it's working."
  },
  {
    "id": "depth-of-field-visual",
    "core": "core1",
    "domain": "bf5",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 8,
    "title": "Control depth of field with camera settings",
    "summary": "A visual walkthrough of enabling depth of field, setting a focus target, and blurring the background.",
    "brief": "A perfectly sharp render everywhere looks flat. Walk through blurring the background behind a subject using the camera's own depth of field settings.",
    "steps": [
      { "instruction": "Select the camera and open its data properties — the camera icon — to find the Depth of Field section.", "zone": "properties", "note": "Camera icon > Depth of Field", "shape": "dof-cube", "propTab": "camera" },
      { "instruction": "Enable Depth of Field, then set the Focus Object to the subject so the camera always tracks focus onto it.", "zone": "properties", "note": "Set Focus Object", "shape": "dof-cube", "propTab": "camera" },
      { "instruction": "Lower the F-Stop value to blur the background more strongly — a smaller number means a shallower, more dramatic blur.", "zone": "properties", "note": "Lower F-Stop", "shape": "dof-cube", "propTab": "camera" },
      { "instruction": "Switch to camera view and Rendered shading to actually see the blur, since it isn't visible in plain Solid mode.", "zone": "header", "note": "Rendered + camera view", "shape": "dof-cube" },
      { "instruction": "If nothing behind the subject is blurring, double check Depth of Field is enabled and a Focus Object or Focus Distance is actually set.", "zone": "properties", "note": "Verify DOF is enabled", "shape": "dof-cube", "propTab": "camera" }
    ],
    "explanation": "Depth of field is what separates a flat, everything-in-focus render from one with a deliberate visual subject — but it depends on Depth of Field actually being enabled with a Focus Object or Focus Distance set, which is the most common reason it silently doesn't seem to work."
  },
  {
    "id": "hdri-world-visual",
    "core": "core1",
    "domain": "bf5",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 9,
    "title": "Use HDRI world lighting for fast, realistic light",
    "summary": "A visual walkthrough of loading an HDRI environment texture to light and reflect an entire scene at once.",
    "brief": "Placing several individual lights to fake realistic lighting is slow. Walk through loading a single HDRI image that lights and reflects the whole scene at once.",
    "steps": [
      { "instruction": "Open the World properties tab — the small globe icon — instead of the object or light data tabs.", "zone": "properties", "note": "Globe icon = World", "shape": "hdri-cube", "propTab": "world" },
      { "instruction": "Click the yellow dot next to Color and choose Environment Texture to load an HDRI image file instead of a flat background color.", "zone": "properties", "note": "Environment Texture", "shape": "hdri-cube", "propTab": "world" },
      { "instruction": "Switch the viewport to Rendered shading to see the whole scene lit and reflected by the HDRI image all at once.", "zone": "header", "note": "Rendered shading", "shape": "hdri-cube" },
      { "instruction": "Adjust the Strength value in the World settings to brighten or dim the overall scene lighting from the HDRI.", "zone": "properties", "note": "Adjust Strength", "shape": "hdri-cube", "propTab": "world" },
      { "instruction": "Rotate the HDRI using its Mapping node's Z rotation so the brightest part of the sky lines up with where you want the highlight.", "zone": "properties", "note": "Rotate HDRI mapping", "shape": "hdri-cube", "propTab": "world" }
    ],
    "explanation": "A single HDRI image can light and reflect an entire scene realistically in one step, which is why it's the fastest way to get believable lighting without manually placing several individual lights."
  },
  {
    "id": "render-engine-settings-visual",
    "core": "core1",
    "domain": "bf6",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Set your render engine and output settings",
    "summary": "A visual walkthrough of choosing a render engine and configuring resolution, file format, and output path before rendering.",
    "brief": "Rendering before the settings are right wastes time. Walk through setting the render engine, resolution, file format, and output path first.",
    "steps": [
      { "instruction": "Open the Render properties tab — the camera-back icon — and choose a Render Engine: Eevee for speed or Cycles for realism.", "zone": "properties", "note": "Choose render engine", "shape": "frame-good", "propTab": "render" },
      { "instruction": "Open the Output properties tab — the printer icon — and set the Resolution to match what the final image actually needs.", "zone": "properties", "note": "Set Resolution", "shape": "frame-good", "propTab": "output" },
      { "instruction": "Set the File Format — PNG for a single still image with transparency support, or FFmpeg Video for a finished animation file.", "zone": "properties", "note": "Choose File Format", "shape": "frame-good", "propTab": "output" },
      { "instruction": "Choose an Output folder path so rendered files land somewhere findable instead of Blender's default temp location.", "zone": "properties", "note": "Set output folder", "shape": "frame-good", "propTab": "output" },
      { "instruction": "Confirm the frame range in the Output tab matches what you intend to render — one frame for a still, or a full range for an animation.", "zone": "properties", "note": "Check frame range", "shape": "frame-good", "propTab": "output" }
    ],
    "explanation": "Render engine, resolution, file format, and output path all have to be set correctly before a render is usable for anything — getting them right before rendering avoids wasted render time on the wrong settings."
  },
  {
    "id": "black-render-visual",
    "core": "core1",
    "domain": "bf6",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Fix a render that comes out black or empty",
    "summary": "A visual walkthrough of the three most common causes behind a render that looks fine in the viewport but renders black.",
    "brief": "The viewport looks correct in Rendered shading, but pressing Render Image produces a black or empty frame. Walk through the most common causes in order.",
    "steps": [
      { "instruction": "Press F12 to render, and notice the viewport looked fine in Rendered shading but the actual render is black or empty.", "zone": "header", "note": "F12 = Render Image", "shape": "frame-black" },
      { "instruction": "Open the Outliner and check the object's camera icon — if it's crossed out, the object is visible in the viewport but excluded from rendering.", "zone": "outliner", "note": "Check render-visibility icon", "shape": "frame-black" },
      { "instruction": "Press Ctrl+Numpad 0 to switch into camera view and confirm the camera is actually pointed at the subject, not off into empty space.", "zone": "viewport", "note": "Confirm camera framing", "shape": "camera-cube" },
      { "instruction": "Check the scene has at least one light, and that the light itself isn't also excluded from rendering in the Outliner.", "zone": "outliner", "note": "Check for a light", "shape": "light" },
      { "instruction": "Render again with F12 once visibility, framing, and lighting are all confirmed, and compare the result to the earlier black frame.", "zone": "header", "note": "Render again", "shape": "frame-good" }
    ],
    "explanation": "A black or empty render almost always comes down to one of three things: an object excluded from rendering despite being visible in the viewport, a camera not actually pointed at anything, or missing light in the scene — checking them in that order rules out the most common causes first instead of guessing at settings unrelated to the actual symptom."
  },
  {
    "id": "render-still-visual",
    "core": "core1",
    "domain": "bf6",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 8,
    "title": "Render and save a still image to disk",
    "summary": "A visual walkthrough of rendering a single frame and actually saving the result as a file.",
    "brief": "Rendering an image and saving it are two separate steps. Walk through rendering a still and writing it to disk in the right format.",
    "steps": [
      { "instruction": "Frame the shot in camera view, then press F12 to render a single still image.", "zone": "viewport", "note": "F12 to render", "shape": "camera-cube" },
      { "instruction": "In the Image Viewer window that opens, wait for the render to fully finish rather than judging it mid-render.", "zone": "header", "note": "Wait for render to finish", "shape": "frame-good" },
      { "instruction": "Go to Image > Save As in the Image Viewer's own menu to save the result as a file.", "zone": "header", "note": "Image > Save As", "shape": "frame-good" },
      { "instruction": "Choose a file format appropriate for the use — PNG for lossless quality with transparency, JPEG for smaller file size without transparency.", "zone": "properties", "note": "Pick PNG or JPEG", "shape": "frame-good", "propTab": "output" },
      { "instruction": "Navigate to the saved file outside Blender to confirm it actually wrote to disk correctly.", "zone": "properties", "note": "Verify the saved file", "shape": "frame-good", "propTab": "output" }
    ],
    "explanation": "Rendering an image and actually saving it to disk are two separate steps — the Image Viewer only holds the result in memory until Save As writes it out as a real file."
  },
  {
    "id": "render-sequence-visual",
    "core": "core1",
    "domain": "bf6",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 10,
    "title": "Render an animation as an image sequence",
    "summary": "A visual walkthrough of rendering a full animation as numbered image files instead of a single video file.",
    "brief": "Professional pipelines render animations as an image sequence, not a single video file. Walk through setting it up correctly.",
    "steps": [
      { "instruction": "In the Output properties tab, set the Frame Start and Frame End to cover the full length of the animation.", "zone": "properties", "note": "Set frame range", "shape": "sequence-frames", "propTab": "output" },
      { "instruction": "Set the File Format to PNG, not a video format, so each frame saves as its own separate image file.", "zone": "properties", "note": "PNG, not video", "shape": "sequence-frames", "propTab": "output" },
      { "instruction": "Confirm the Output path ends in a folder, since an image sequence produces one file per frame rather than a single file.", "zone": "properties", "note": "Output to a folder", "shape": "sequence-frames", "propTab": "output" },
      { "instruction": "Choose Render > Render Animation, or press Ctrl+F12, instead of F12, which only renders the current single frame.", "zone": "header", "note": "Ctrl+F12 = Render Animation", "shape": "sequence-frames" },
      { "instruction": "Once finished, check the output folder for a full sequence of numbered image files, one per frame, ready to be assembled into a video later.", "zone": "properties", "note": "Check numbered output files", "shape": "sequence-frames", "propTab": "output" }
    ],
    "explanation": "An image sequence, not a single video file, is the standard way animations actually get rendered — it's far cheaper to lose one frame to a crash or power loss than to lose an entire finished video file, which is why professional pipelines render this way."
  },
  {
    "id": "keyframe-bounce-visual",
    "core": "core1",
    "domain": "bf7",
    "type": "visual",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Keyframe a simple bounce",
    "summary": "A visual walkthrough of setting two keyframes and previewing the motion between them.",
    "brief": "Animation starts with two keyframes and a change in between. Walk through moving an object from one position to another over time.",
    "steps": [
      { "instruction": "Move the playhead to frame 1 in the Timeline at the bottom of the screen.", "zone": "timeline", "note": "Frame 1", "shape": "cube" },
      { "instruction": "Set the first keyframe. With the object selected, press I and choose Location to record its starting position.", "zone": "viewport", "note": "I > Location", "shape": "cube" },
      { "instruction": "Move the playhead forward to frame 15 in the Timeline.", "zone": "timeline", "note": "Frame 15", "shape": "cube" },
      { "instruction": "Move the object upward, then press I again to keyframe this new position at frame 15.", "zone": "viewport", "note": "Move up, then I", "shape": "cube-up", "shapeNote": "Second keyframe recorded" },
      { "instruction": "Ease the motion. Open the Graph Editor below the timeline and drag the curve handles so the object eases in and out instead of moving at a constant speed.", "zone": "timeline", "note": "Graph Editor easing", "shape": "cube-up" }
    ],
    "explanation": "Two keyframes with different values is the entire foundation of animation — everything else, from easing curves to full character rigs, is refinement on top of that same basic idea: record a value, change it, record it again, and let Blender interpolate the motion in between."
  },
  {
    "id": "dope-sheet-visual",
    "core": "core1",
    "domain": "bf7",
    "type": "visual",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Manage keyframes in the Dope Sheet",
    "summary": "A visual walkthrough of viewing every keyframe at once and retiming an action in the Dope Sheet.",
    "brief": "The Timeline only shows the current frame's context. Walk through switching to the Dope Sheet to see and retime every keyframe in an animation at once.",
    "steps": [
      { "instruction": "Switch the Timeline area to the Dope Sheet editor to see every keyframe across the whole animation at once, not just the current frame.", "zone": "timeline", "note": "Switch to Dope Sheet", "shape": "cube" },
      { "instruction": "Box-select a group of keyframes by dragging across them, rather than clicking each one individually.", "zone": "timeline", "note": "Box-select keyframes", "shape": "cube" },
      { "instruction": "Press G and drag to slide the selected keyframes earlier or later in time, retiming the action without changing its values.", "zone": "timeline", "note": "G to retime keyframes", "shape": "cube" },
      { "instruction": "Press S to scale the selected keyframes closer together or further apart, speeding up or slowing down that part of the motion.", "zone": "timeline", "note": "S to scale timing", "shape": "cube" },
      { "instruction": "Select an unwanted keyframe and press X to delete it, cleaning up the action without disturbing the rest.", "zone": "timeline", "note": "X to delete a keyframe", "shape": "cube" }
    ],
    "explanation": "The Dope Sheet shows every keyframe across the whole timeline at once, which is what makes retiming and cleaning up an animation practical instead of hunting for individual keyframes one at a time in the Timeline."
  },
  {
    "id": "graph-editor-easing-visual",
    "core": "core1",
    "domain": "bf7",
    "type": "visual",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Ease motion using the Graph Editor",
    "summary": "A visual walkthrough of shaping a motion curve's handles so an animation eases in and out instead of moving at constant speed.",
    "brief": "Constant-speed motion between two keyframes looks mechanical. Walk through using the Graph Editor to ease it into something that reads as natural.",
    "steps": [
      { "instruction": "Open the Graph Editor to see the selected object's motion drawn as a curve instead of just markers on a timeline.", "zone": "timeline", "note": "Open Graph Editor", "shape": "cube-up" },
      { "instruction": "Select a keyframe's curve handle and press V to change its interpolation type, switching from a straight Linear line to a smooth Bezier curve.", "zone": "timeline", "note": "V = handle type", "shape": "cube-up" },
      { "instruction": "Drag the curve handles themselves to flatten the start and end of the motion, creating a natural ease-in and ease-out.", "zone": "timeline", "note": "Drag handles to ease", "shape": "cube-up" },
      { "instruction": "Select all keyframes and press Shift+E, then choose Ease In and Out as a quick shortcut instead of manually dragging every handle.", "zone": "timeline", "note": "Shift+E = quick ease", "shape": "cube-up" },
      { "instruction": "Scrub the playhead through the range and compare how much more natural the eased curve feels versus the original straight-line motion.", "zone": "timeline", "note": "Scrub to compare", "shape": "cube-up" }
    ],
    "explanation": "Constant-speed motion between two keyframes reads as mechanical and lifeless — easing the curve's handles, or using the Ease In/Out shortcut, is what makes motion feel natural instead of robotic."
  },
  {
    "id": "orbit-parent-camera-visual",
    "core": "core1",
    "domain": "bf7",
    "type": "visual",
    "difficulty": "Expert",
    "minutes": 10,
    "title": "Parent a camera to an empty for a smooth orbit animation",
    "summary": "A visual walkthrough of parenting a camera to a rotating Empty to animate a smooth 360-degree orbit.",
    "brief": "Hand-keyframing a camera's own position to orbit an object is fiddly. Walk through parenting it to an Empty and animating the Empty's rotation instead.",
    "steps": [
      { "instruction": "Press Shift+A and choose Empty > Plain Axes, placing it at the exact center point the camera should orbit around.", "zone": "viewport", "note": "Add an Empty at center", "shape": "orbit-path" },
      { "instruction": "Select the camera, then Shift-click the Empty last, and press Ctrl+P to parent the camera to it.", "zone": "viewport", "note": "Parent camera to Empty", "shape": "orbit-path" },
      { "instruction": "Select the Empty, go to frame 1, and keyframe its Z Rotation at 0 degrees using I.", "zone": "timeline", "note": "Keyframe rotation at 0°", "shape": "orbit-path" },
      { "instruction": "Move to the last frame of the animation, set the Empty's Z Rotation to 360 degrees, and keyframe it again — the camera now orbits as the Empty spins.", "zone": "timeline", "note": "Keyframe 360° at last frame", "shape": "orbit-path" },
      { "instruction": "Set both rotation keyframes' interpolation to Linear in the Graph Editor, since Bezier easing would make a full orbit visibly speed up and slow down oddly.", "zone": "timeline", "note": "Set interpolation to Linear", "shape": "orbit-path" }
    ],
    "explanation": "Parenting the camera to a rotating Empty is how a smooth orbit gets animated without hand-keyframing the camera's own position at every frame, and Linear interpolation keeps a full rotation from oddly speeding up and slowing down partway through."
  }
];
})();

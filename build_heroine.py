import bpy
import math
import os
from mathutils import Vector, Matrix, Euler

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_material(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    
    # Base Color
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.0)
    
    # Metallic & Roughness
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
        
    # Emission (Blender 4.0+ and 5.0+ Principled BSDF has 'Emission Color' and 'Emission Strength')
    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = (*emission, 1.0)
            
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
            
    output = nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_heroine_mesh():
    clear_scene()
    
    # 1. Setup Materials based on Reference Sheet
    mats = {
        'skin': create_material("Skin_Warm", (0.35, 0.22, 0.15), metallic=0.0, roughness=0.55),
        'hair': create_material("Hair_Braids", (0.05, 0.04, 0.04), metallic=0.05, roughness=0.85),
        'armor': create_material("Armor_Slate", (0.10, 0.14, 0.16), metallic=0.85, roughness=0.3),
        'armor_trim': create_material("Armor_Trim", (0.18, 0.22, 0.25), metallic=0.9, roughness=0.25),
        'leather_brown': create_material("Leather_Brown", (0.24, 0.14, 0.08), metallic=0.0, roughness=0.65),
        'leather_dark': create_material("Leather_Dark", (0.08, 0.07, 0.07), metallic=0.0, roughness=0.7),
        'pants': create_material("Pants_Fabric", (0.12, 0.09, 0.08), metallic=0.0, roughness=0.8),
        'runes': create_material("Rune_Glow_Cyan", (0.15, 0.95, 1.0), metallic=0.2, roughness=0.1, emission=(0.18, 0.96, 1.0), emission_strength=4.5),
        'gold': create_material("Gold_Trim", (0.85, 0.65, 0.2), metallic=0.9, roughness=0.35)
    }

    collection = bpy.context.scene.collection
    created_objects = []

    def add_mesh(obj, mat=None):
        if obj.name not in collection.objects:
            try:
                collection.objects.link(obj)
            except Exception:
                pass
        if mat and hasattr(obj, 'data') and hasattr(obj.data, 'materials'):
            obj.data.materials.append(mat)
        created_objects.append(obj)
        return obj

    # --- Head & Face ---
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.13, location=(0, 0, 1.62))
    head = bpy.context.active_object
    head.name = "Head"
    head.scale = (0.88, 1.02, 1.0)
    add_mesh(head, mats['skin'])

    # Forehead Rune Mark (Reference: glowing forehead emblem)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.024, depth=0.005, location=(0, 0.126, 1.66))
    forehead_rune = bpy.context.active_object
    forehead_rune.rotation_euler = (math.radians(90), 0, 0)
    add_mesh(forehead_rune, mats['runes'])

    # Cyan Drop Earrings
    for side, sx in [("L", 0.12), ("R", -0.12)]:
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.012, depth=0.04, location=(sx, 0.01, 1.58))
        earring = bpy.context.active_object
        earring.name = f"Earring_{side}"
        add_mesh(earring, mats['runes'])

    # --- Braided Hair Cap & High Braided Ponytail ---
    # Hair cap
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.138, location=(0, -0.015, 1.64))
    hair_cap = bpy.context.active_object
    hair_cap.name = "Hair_Braided_Cap"
    hair_cap.scale = (0.92, 1.04, 0.98)
    add_mesh(hair_cap, mats['hair'])

    # Braided Ponytail hanging down the back (Reference: High ponytail with segments)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.038, depth=0.06, location=(0, -0.12, 1.70))
    knot = bpy.context.active_object
    knot.rotation_euler = (math.radians(-35), 0, 0)
    add_mesh(knot, mats['gold'])

    prev_y, prev_z = -0.14, 1.68
    for i in range(8):
        seg_z = prev_z - 0.07
        seg_y = prev_y - 0.018 * math.sin(i * 0.4)
        rad = 0.035 * (1.0 - i * 0.07)
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=rad, depth=0.08, location=(0, seg_y, seg_z))
        tail_seg = bpy.context.active_object
        tail_seg.name = f"Ponytail_Seg_{i}"
        tail_seg.rotation_euler = (math.radians(-15 + i * 2), 0, 0)
        add_mesh(tail_seg, mats['hair'])
        prev_y, prev_z = seg_y, seg_z

    # --- Neck & Torso ---
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.065, depth=0.12, location=(0, 0, 1.50))
    neck = bpy.context.active_object
    neck.name = "Neck"
    add_mesh(neck, mats['skin'])

    # Cuirass / Chest Armor (Reference: sculpted breastplate with glowing cyan runes)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.185, depth=0.28, location=(0, 0.01, 1.35))
    cuirass = bpy.context.active_object
    cuirass.name = "Cuirass"
    cuirass.scale = (1.18, 0.88, 1.0)
    add_mesh(cuirass, mats['armor'])

    # Chest Rune Emblem (Front glowing cyan motif)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.06, depth=0.01, location=(0, 0.165, 1.36))
    chest_rune = bpy.context.active_object
    chest_rune.name = "Chest_Rune_Emblem"
    chest_rune.rotation_euler = (math.radians(85), 0, 0)
    chest_rune.scale = (1.4, 0.8, 1.0)
    add_mesh(chest_rune, mats['runes'])

    # Collar trim
    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.018, location=(0, 0.01, 1.48))
    collar = bpy.context.active_object
    collar.name = "Armor_Collar"
    add_mesh(collar, mats['armor_trim'])

    # Midriff (Reference: exposed muscular athletic waist)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.148, depth=0.16, location=(0, 0.005, 1.15))
    midriff = bpy.context.active_object
    midriff.name = "Midriff"
    midriff.scale = (1.1, 0.88, 1.0)
    add_mesh(midriff, mats['skin'])

    # --- Double Leather Belt & Buckle & Pouches ---
    bpy.ops.mesh.primitive_torus_add(major_radius=0.175, minor_radius=0.024, location=(0, 0, 1.04))
    belt1 = bpy.context.active_object
    belt1.name = "Belt_Upper"
    belt1.scale = (1.12, 0.9, 1.0)
    add_mesh(belt1, mats['leather_brown'])

    bpy.ops.mesh.primitive_torus_add(major_radius=0.182, minor_radius=0.02, location=(0, 0, 0.99))
    belt2 = bpy.context.active_object
    belt2.name = "Belt_Lower"
    belt2.rotation_euler = (math.radians(6), 0, 0)
    belt2.scale = (1.14, 0.92, 1.0)
    add_mesh(belt2, mats['leather_dark'])

    # Circular Buckle
    bpy.ops.mesh.primitive_torus_add(major_radius=0.045, minor_radius=0.012, location=(0, 0.195, 1.03))
    buckle = bpy.context.active_object
    buckle.rotation_euler = (math.radians(90), 0, 0)
    add_mesh(buckle, mats['armor_trim'])

    # Side Pouches (Reference: hip pouches)
    for px, rot in [(-0.19, -0.2), (0.19, 0.2)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, -0.02, 1.01))
        pouch = bpy.context.active_object
        pouch.name = f"Pouch_{'L' if px>0 else 'R'}"
        pouch.scale = (0.07, 0.11, 0.09)
        pouch.rotation_euler = (0, 0, rot)
        add_mesh(pouch, mats['leather_brown'])

    # --- Layered Tassets (Battle Skirt with Glowing Runes) ---
    # Front Hanging Tasset
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.17, 0.91))
    front_tasset = bpy.context.active_object
    front_tasset.name = "Tasset_Front"
    front_tasset.scale = (0.13, 0.02, 0.18)
    front_tasset.rotation_euler = (math.radians(-10), 0, 0)
    add_mesh(front_tasset, mats['armor_trim'])

    # Side Hip Tassets with Glowing Runes (Reference: curved plate over hips with heraldic rune)
    for side, sx in [("L", 0.195), ("R", -0.195)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, 0.0, 0.90))
        side_tasset = bpy.context.active_object
        side_tasset.name = f"Tasset_Side_{side}"
        side_tasset.scale = (0.025, 0.16, 0.22)
        side_tasset.rotation_euler = (0, math.radians(-14 if sx>0 else 14), 0)
        add_mesh(side_tasset, mats['armor'])

        # Glowing Rune Plate on Side Tasset
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.045, depth=0.008, location=(sx * 1.05, 0.0, 0.90))
        tasset_rune = bpy.context.active_object
        tasset_rune.name = f"Tasset_Rune_{side}"
        tasset_rune.rotation_euler = (0, math.radians(-90 if sx>0 else 90), 0)
        add_mesh(tasset_rune, mats['runes'])

    # Back Tassets
    for bx in [-0.09, 0.09]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, -0.16, 0.88))
        back_tasset = bpy.context.active_object
        back_tasset.name = f"Tasset_Back_{'L' if bx>0 else 'R'}"
        back_tasset.scale = (0.08, 0.02, 0.22)
        back_tasset.rotation_euler = (math.radians(12), 0, 0)
        add_mesh(back_tasset, mats['leather_dark'])

    # --- Shoulders & Arms ---
    for side, sx in [("L", 0.24), ("R", -0.24)]:
        # Segmented Pauldron (3 curved overlapping plates - Reference: 3-tiered shoulder guards)
        for layer in range(3):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.09 - layer * 0.01, location=(sx * (1.0 + layer * 0.08), 0.0, 1.43 - layer * 0.06))
            pauldron = bpy.context.active_object
            pauldron.name = f"Pauldron_{side}_Layer{layer+1}"
            pauldron.scale = (0.7, 1.2, 0.6)
            pauldron.rotation_euler = (0, math.radians(20 if sx>0 else -20), math.radians(-25 if sx>0 else 25))
            add_mesh(pauldron, mats['armor'])

            # Glowing trim on top pauldron
            if layer == 0:
                bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.012, location=(sx * 1.02, 0.0, 1.45))
                p_trim = bpy.context.active_object
                p_trim.name = f"Pauldron_Glow_{side}"
                p_trim.rotation_euler = (0, math.radians(20 if sx>0 else -20), math.radians(-25 if sx>0 else 25))
                add_mesh(p_trim, mats['runes'])

        # Upper Arm
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.048, depth=0.22, location=(sx * 1.15, 0.0, 1.28))
        upper_arm = bpy.context.active_object
        upper_arm.name = f"UpperArm_{side}"
        add_mesh(upper_arm, mats['skin'])

        # Upper Arm Leather Band
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.052, depth=0.05, location=(sx * 1.15, 0.0, 1.32))
        arm_band = bpy.context.active_object
        arm_band.name = f"ArmBand_{side}"
        add_mesh(arm_band, mats['leather_brown'])

        # Forearm Bracer with Glowing Runes (Reference: Armored gauntlets with runic glyphs)
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.048, depth=0.22, location=(sx * 1.35, 0.0, 1.05))
        bracer = bpy.context.active_object
        bracer.name = f"Bracer_{side}"
        add_mesh(bracer, mats['armor'])

        # Bracer Glowing Rune Inlay
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.025, depth=0.14, location=(sx * 1.38, 0.035, 1.05))
        bracer_rune = bpy.context.active_object
        bracer_rune.name = f"Bracer_Rune_{side}"
        add_mesh(bracer_rune, mats['runes'])

        # Hand / Wraps
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx * 1.48, 0.0, 0.88))
        hand = bpy.context.active_object
        hand.name = f"Hand_{side}"
        hand.scale = (0.04, 0.08, 0.10)
        add_mesh(hand, mats['leather_dark'])

    # --- Legs, Knees & Greaves ---
    for side, lx in [("L", 0.11), ("R", -0.11)]:
        # Pants / Thighs
        bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.082, depth=0.36, location=(lx, 0.005, 0.78))
        thigh = bpy.context.active_object
        thigh.name = f"Thigh_{side}"
        add_mesh(thigh, mats['pants'])

        # Knee Guard (Reference: pointed knee armor with swirl rune)
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.065, depth=0.08, location=(lx, 0.075, 0.58))
        knee = bpy.context.active_object
        knee.name = f"Knee_Armor_{side}"
        knee.rotation_euler = (math.radians(90), 0, 0)
        add_mesh(knee, mats['armor'])

        # Knee Swirl Rune
        bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.008, location=(lx, 0.118, 0.58))
        knee_rune = bpy.context.active_object
        knee_rune.rotation_euler = (math.radians(90), 0, 0)
        add_mesh(knee_rune, mats['runes'])

        # Shin Greaves with Glowing Glyphs (Reference: armored shins with cyan glyphs)
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.068, depth=0.34, location=(lx, 0.015, 0.36))
        greave = bpy.context.active_object
        greave.name = f"Greave_{side}"
        add_mesh(greave, mats['armor'])

        # Shin Glowing Rune Strips
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.02, depth=0.22, location=(lx, 0.078, 0.36))
        shin_rune = bpy.context.active_object
        shin_rune.name = f"Shin_Rune_{side}"
        add_mesh(shin_rune, mats['runes'])

        # Leather Boots
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(lx, 0.04, 0.10))
        boot = bpy.context.active_object
        boot.name = f"Boot_{side}"
        boot.scale = (0.07, 0.16, 0.12)
        add_mesh(boot, mats['leather_brown'])

    # --- Arco de Luz (Light Bow - Reference: Breakdown Arco de Luz) ---
    bow_root = bpy.data.objects.new("Arco_De_Luz", None)
    collection.objects.link(bow_root)
    created_objects.append(bow_root)
    bow_root.location = (0.42, 0.12, 1.05)
    bow_root.rotation_euler = (math.radians(15), math.radians(80), 0)

    # Bow Grip
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.022, depth=0.18, location=(0, 0, 0))
    grip = bpy.context.active_object
    grip.name = "Bow_Grip"
    grip.parent = bow_root
    add_mesh(grip, mats['leather_dark'])

    # Upper and Lower Recurve Limbs with Glowing Energy Blades
    for dir_mult, name in [(1, "Upper"), (-1, "Lower")]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.02, depth=0.48, location=(0, 0.04, dir_mult * 0.30))
        limb = bpy.context.active_object
        limb.name = f"Bow_Limb_{name}"
        limb.rotation_euler = (math.radians(dir_mult * -24), 0, 0)
        limb.parent = bow_root
        add_mesh(limb, mats['armor'])

        # Luminous Recurve Blade
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.09, dir_mult * 0.35))
        blade = bpy.context.active_object
        blade.name = f"Bow_Energy_Blade_{name}"
        blade.scale = (0.012, 0.045, 0.42)
        blade.rotation_euler = (math.radians(dir_mult * -28), 0, 0)
        blade.parent = bow_root
        add_mesh(blade, mats['runes'])

        # Bow Tip
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.025, depth=0.14, location=(0, 0.14, dir_mult * 0.58))
        tip = bpy.context.active_object
        tip.name = f"Bow_Tip_{name}"
        tip.rotation_euler = (math.radians(dir_mult * 45), 0, 0)
        tip.parent = bow_root
        add_mesh(tip, mats['runes'])

    # --- Dron Compañero (Companion Drone - Reference: Breakdown Dron Compañero) ---
    drone_root = bpy.data.objects.new("Dron_Companero", None)
    collection.objects.link(drone_root)
    created_objects.append(drone_root)
    drone_root.location = (0.55, -0.32, 1.82)

    # Flattened Saucer Chassis
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=0.18, location=(0, 0, 0))
    drone_body = bpy.context.active_object
    drone_body.name = "Drone_Chassis"
    drone_body.scale = (1.0, 1.0, 0.58)
    drone_body.parent = drone_root
    add_mesh(drone_body, mats['armor'])

    # Concentric Glowing Sensor Rings (Reference: concentric circular eye/core)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.016, location=(0, 0, 0.08))
    d_ring1 = bpy.context.active_object
    d_ring1.name = "Drone_Rune_Ring_Outer"
    d_ring1.parent = drone_root
    add_mesh(d_ring1, mats['runes'])

    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.055, location=(0, 0, 0.09))
    d_pupil = bpy.context.active_object
    d_pupil.name = "Drone_Eye_Core"
    d_pupil.parent = drone_root
    add_mesh(d_pupil, mats['runes'])

    # 3 Stabilizer Thruster Fins (Reference: 3 angled wings with blue energy nodes)
    for i in range(3):
        angle = (i * 2 * math.pi) / 3
        fx = math.cos(angle) * 0.24
        fy = math.sin(angle) * 0.24
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(fx, fy, -0.02))
        fin = bpy.context.active_object
        fin.name = f"Drone_Fin_{i+1}"
        fin.scale = (0.025, 0.12, 0.08)
        fin.rotation_euler = (0, 0, angle)
        fin.parent = drone_root
        add_mesh(fin, mats['armor'])

        # Glowing Node on Fin Tip
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.022, depth=0.06, location=(fx * 1.3, fy * 1.3, -0.02))
        node = bpy.context.active_object
        node.name = f"Drone_Thruster_Node_{i+1}"
        node.rotation_euler = (0, 0, angle)
        node.parent = drone_root
        add_mesh(node, mats['runes'])

    # Smooth Shading on all meshes
    for obj in created_objects:
        if obj.type == 'MESH':
            try:
                obj.data.shade_smooth()
            except Exception:
                for f in obj.data.polygons:
                    f.use_smooth = True

    # 4. Save .blend file
    blend_path = os.path.abspath("models/heroine_aria.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"BLEND_SAVED: {blend_path}")

    # 5. Export .glb
    glb_path = os.path.abspath("models/heroine_aria.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT'
    )
    print(f"GLB_EXPORTED: {glb_path}")

if __name__ == "__main__":
    create_heroine_mesh()

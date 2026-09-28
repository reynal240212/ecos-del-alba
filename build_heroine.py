import bpy
import math
import os
from mathutils import Vector, Euler, Matrix

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_material(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = (*base_color, 1.0)

    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness

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

def create_heroine_rigged():
    clear_scene()

    # Materials Palette from Aurora Studios Reference Sheet
    mats = {
        'skin': create_material("Skin_Warm", (0.35, 0.22, 0.15), metallic=0.0, roughness=0.55),
        'hair': create_material("Hair_Braids", (0.05, 0.04, 0.04), metallic=0.05, roughness=0.85),
        'armor': create_material("Armor_Slate", (0.10, 0.14, 0.16), metallic=0.85, roughness=0.28),
        'armor_trim': create_material("Armor_Trim", (0.18, 0.22, 0.25), metallic=0.9, roughness=0.22),
        'leather_brown': create_material("Leather_Brown", (0.24, 0.14, 0.08), metallic=0.0, roughness=0.65),
        'leather_dark': create_material("Leather_Dark", (0.08, 0.07, 0.07), metallic=0.0, roughness=0.7),
        'pants': create_material("Pants_Fabric", (0.12, 0.09, 0.08), metallic=0.0, roughness=0.8),
        'runes': create_material("Rune_Glow_Cyan", (0.18, 0.96, 1.0), metallic=0.2, roughness=0.1, emission=(0.18, 0.96, 1.0), emission_strength=4.5),
        'gold': create_material("Gold_Trim", (0.85, 0.65, 0.2), metallic=0.9, roughness=0.35)
    }

    collection = bpy.context.scene.collection
    mesh_objects = {}

    def reg_mesh(obj, name, mat=None):
        obj.name = name
        if mat and hasattr(obj, 'data') and hasattr(obj.data, 'materials'):
            obj.data.materials.append(mat)
        mesh_objects[name] = obj
        return obj

    # 1. Mesh Construction
    # Head & Details
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.13, location=(0, 0, 1.62))
    head = reg_mesh(bpy.context.active_object, "Head", mats['skin'])
    head.scale = (0.88, 1.02, 1.0)

    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.024, depth=0.005, location=(0, 0.126, 1.66))
    f_rune = reg_mesh(bpy.context.active_object, "Forehead_Rune", mats['runes'])
    f_rune.rotation_euler = (math.radians(90), 0, 0)

    for side, sx in [("L", 0.12), ("R", -0.12)]:
        bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.012, depth=0.04, location=(sx, 0.01, 1.58))
        reg_mesh(bpy.context.active_object, f"Earring_{side}", mats['runes'])

    # Braided Hair Cap & Ponytail
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.138, location=(0, -0.015, 1.64))
    hair_cap = reg_mesh(bpy.context.active_object, "Hair_Braided_Cap", mats['hair'])
    hair_cap.scale = (0.92, 1.04, 0.98)

    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.038, depth=0.06, location=(0, -0.12, 1.70))
    knot = reg_mesh(bpy.context.active_object, "Ponytail_Knot", mats['gold'])
    knot.rotation_euler = (math.radians(-35), 0, 0)

    prev_y, prev_z = -0.14, 1.68
    for i in range(4):
        seg_z = prev_z - 0.11
        seg_y = prev_y - 0.025
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.032 - i * 0.005, depth=0.12, location=(0, seg_y, seg_z))
        tail = reg_mesh(bpy.context.active_object, f"Ponytail_Seg_{i+1}", mats['hair'])
        tail.rotation_euler = (math.radians(-18 + i * 4), 0, 0)
        prev_y, prev_z = seg_y, seg_z

    # Neck, Cuirass, Midriff
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.065, depth=0.12, location=(0, 0, 1.50))
    reg_mesh(bpy.context.active_object, "Neck", mats['skin'])

    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.185, depth=0.28, location=(0, 0.01, 1.35))
    cuirass = reg_mesh(bpy.context.active_object, "Cuirass", mats['armor'])
    cuirass.scale = (1.18, 0.88, 1.0)

    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.06, depth=0.01, location=(0, 0.165, 1.36))
    c_rune = reg_mesh(bpy.context.active_object, "Chest_Rune_Emblem", mats['runes'])
    c_rune.rotation_euler = (math.radians(85), 0, 0)
    c_rune.scale = (1.4, 0.8, 1.0)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.018, location=(0, 0.01, 1.48))
    reg_mesh(bpy.context.active_object, "Armor_Collar", mats['armor_trim'])

    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.148, depth=0.16, location=(0, 0.005, 1.15))
    midriff = reg_mesh(bpy.context.active_object, "Midriff", mats['skin'])
    midriff.scale = (1.1, 0.88, 1.0)

    # Double Belt & Pouches
    bpy.ops.mesh.primitive_torus_add(major_radius=0.175, minor_radius=0.024, location=(0, 0, 1.04))
    b1 = reg_mesh(bpy.context.active_object, "Belt_Upper", mats['leather_brown'])
    b1.scale = (1.12, 0.9, 1.0)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.182, minor_radius=0.02, location=(0, 0, 0.99))
    b2 = reg_mesh(bpy.context.active_object, "Belt_Lower", mats['leather_dark'])
    b2.rotation_euler = (math.radians(6), 0, 0)
    b2.scale = (1.14, 0.92, 1.0)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.045, minor_radius=0.012, location=(0, 0.195, 1.03))
    buckle = reg_mesh(bpy.context.active_object, "Belt_Buckle", mats['armor_trim'])
    buckle.rotation_euler = (math.radians(90), 0, 0)

    for px, rot in [(-0.19, -0.2), (0.19, 0.2)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, -0.02, 1.01))
        pouch = reg_mesh(bpy.context.active_object, f"Pouch_{'L' if px>0 else 'R'}", mats['leather_brown'])
        pouch.scale = (0.07, 0.11, 0.09)
        pouch.rotation_euler = (0, 0, rot)

    # Tassets (Faulds)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.17, 0.91))
    front_tasset = reg_mesh(bpy.context.active_object, "Tasset_Front", mats['armor_trim'])
    front_tasset.scale = (0.13, 0.02, 0.18)
    front_tasset.rotation_euler = (math.radians(-10), 0, 0)

    for side, sx in [("L", 0.195), ("R", -0.195)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, 0.0, 0.90))
        st = reg_mesh(bpy.context.active_object, f"Tasset_Side_{side}", mats['armor'])
        st.scale = (0.025, 0.16, 0.22)
        st.rotation_euler = (0, math.radians(-14 if sx>0 else 14), 0)

        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.045, depth=0.008, location=(sx * 1.05, 0.0, 0.90))
        sr = reg_mesh(bpy.context.active_object, f"Tasset_Rune_{side}", mats['runes'])
        sr.rotation_euler = (0, math.radians(-90 if sx>0 else 90), 0)

    for bx in [-0.09, 0.09]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, -0.16, 0.88))
        bt = reg_mesh(bpy.context.active_object, f"Tasset_Back_{'L' if bx>0 else 'R'}", mats['leather_dark'])
        bt.scale = (0.08, 0.02, 0.22)
        bt.rotation_euler = (math.radians(12), 0, 0)

    # Pauldrons & Arms
    for side, sx in [("L", 0.24), ("R", -0.24)]:
        for layer in range(3):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.09 - layer * 0.01, location=(sx * (1.0 + layer * 0.08), 0.0, 1.43 - layer * 0.06))
            pld = reg_mesh(bpy.context.active_object, f"Pauldron_{side}_{layer+1}", mats['armor'])
            pld.scale = (0.7, 1.2, 0.6)
            pld.rotation_euler = (0, math.radians(20 if sx>0 else -20), math.radians(-25 if sx>0 else 25))

        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.048, depth=0.22, location=(sx * 1.15, 0.0, 1.28))
        reg_mesh(bpy.context.active_object, f"UpperArm_{side}", mats['skin'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.052, depth=0.05, location=(sx * 1.15, 0.0, 1.32))
        reg_mesh(bpy.context.active_object, f"ArmBand_{side}", mats['leather_brown'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.048, depth=0.22, location=(sx * 1.35, 0.0, 1.05))
        reg_mesh(bpy.context.active_object, f"Bracer_{side}", mats['armor'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.025, depth=0.14, location=(sx * 1.38, 0.035, 1.05))
        reg_mesh(bpy.context.active_object, f"Bracer_Rune_{side}", mats['runes'])

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx * 1.48, 0.0, 0.88))
        hnd = reg_mesh(bpy.context.active_object, f"Hand_{side}", mats['leather_dark'])
        hnd.scale = (0.04, 0.08, 0.10)

    # Legs, Knees, Greaves, Boots
    for side, lx in [("L", 0.11), ("R", -0.11)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.082, depth=0.36, location=(lx, 0.005, 0.78))
        reg_mesh(bpy.context.active_object, f"Thigh_{side}", mats['pants'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.065, depth=0.08, location=(lx, 0.075, 0.58))
        kn = reg_mesh(bpy.context.active_object, f"Knee_{side}", mats['armor'])
        kn.rotation_euler = (math.radians(90), 0, 0)

        bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.008, location=(lx, 0.118, 0.58))
        kr = reg_mesh(bpy.context.active_object, f"Knee_Rune_{side}", mats['runes'])
        kr.rotation_euler = (math.radians(90), 0, 0)

        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.068, depth=0.34, location=(lx, 0.015, 0.36))
        reg_mesh(bpy.context.active_object, f"Greave_{side}", mats['armor'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.02, depth=0.22, location=(lx, 0.078, 0.36))
        reg_mesh(bpy.context.active_object, f"Shin_Rune_{side}", mats['runes'])

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(lx, 0.04, 0.10))
        bt = reg_mesh(bpy.context.active_object, f"Boot_{side}", mats['leather_brown'])
        bt.scale = (0.07, 0.16, 0.12)

    # Light Bow (attached near Hand_L)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.022, depth=0.18, location=(0.38, 0.05, 0.88))
    bow_grip = reg_mesh(bpy.context.active_object, "Bow_Grip", mats['leather_dark'])
    bow_grip.rotation_euler = (math.radians(15), math.radians(75), 0)

    for dir_mult, name in [(1, "Upper"), (-1, "Lower")]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.02, depth=0.48, location=(0.38, 0.08, 0.88 + dir_mult * 0.28))
        bl = reg_mesh(bpy.context.active_object, f"Bow_Limb_{name}", mats['armor'])
        bl.rotation_euler = (math.radians(dir_mult * -24 + 15), math.radians(75), 0)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.38, 0.12, 0.88 + dir_mult * 0.34))
        be = reg_mesh(bpy.context.active_object, f"Bow_Blade_{name}", mats['runes'])
        be.scale = (0.012, 0.045, 0.42)
        be.rotation_euler = (math.radians(dir_mult * -28 + 15), math.radians(75), 0)

    # Companion Drone (Orbiting above right shoulder)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=0.18, location=(0.55, -0.28, 1.82))
    d_body = reg_mesh(bpy.context.active_object, "Drone_Chassis", mats['armor'])
    d_body.scale = (1.0, 1.0, 0.58)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.016, location=(0.55, -0.28, 1.90))
    reg_mesh(bpy.context.active_object, "Drone_Rune_Ring", mats['runes'])

    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.055, location=(0.55, -0.28, 1.91))
    reg_mesh(bpy.context.active_object, "Drone_Core_Eye", mats['runes'])

    for i in range(3):
        angle = (i * 2 * math.pi) / 3
        fx = 0.55 + math.cos(angle) * 0.24
        fy = -0.28 + math.sin(angle) * 0.24
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(fx, fy, 1.80))
        fin = reg_mesh(bpy.context.active_object, f"Drone_Fin_{i+1}", mats['armor'])
        fin.scale = (0.025, 0.12, 0.08)
        fin.rotation_euler = (0, 0, angle)

    # Apply smooth shading to all meshes
    for obj in mesh_objects.values():
        if obj.type == 'MESH':
            try:
                obj.data.shade_smooth()
            except Exception:
                for f in obj.data.polygons:
                    f.use_smooth = True

    # 2. Build Armature (Rig / Skeleton)
    arm_data = bpy.data.armatures.new("Heroine_Armature")
    arm_obj = bpy.data.objects.new("Heroine_Rig", arm_data)
    collection.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    eb = arm_data.edit_bones

    # Hierarchy
    r_bone = eb.new("Root")
    r_bone.head = (0, 0, 0)
    r_bone.tail = (0, 0, 0.1)

    hips = eb.new("Hips")
    hips.head = (0, 0, 0.98)
    hips.tail = (0, 0, 1.15)
    hips.parent = r_bone

    spine = eb.new("Spine")
    spine.head = (0, 0, 1.15)
    spine.tail = (0, 0, 1.30)
    spine.parent = hips

    chest = eb.new("Chest")
    chest.head = (0, 0, 1.30)
    chest.tail = (0, 0, 1.48)
    chest.parent = spine

    neck = eb.new("Neck")
    neck.head = (0, 0, 1.48)
    neck.tail = (0, 0, 1.56)
    neck.parent = chest

    head_b = eb.new("Head")
    head_b.head = (0, 0, 1.56)
    head_b.tail = (0, 0, 1.76)
    head_b.parent = neck

    # Ponytail chain
    prev_pt = head_b
    for i in range(4):
        pt_b = eb.new(f"Ponytail.{i+1:02d}")
        pt_b.head = (0, -0.12 - i * 0.05, 1.68 - i * 0.10)
        pt_b.tail = (0, -0.14 - i * 0.05, 1.58 - i * 0.10)
        pt_b.parent = prev_pt
        prev_pt = pt_b

    # Left Arm
    sh_l = eb.new("Shoulder.L")
    sh_l.head = (0.08, 0, 1.44)
    sh_l.tail = (0.22, 0, 1.42)
    sh_l.parent = chest

    ua_l = eb.new("UpperArm.L")
    ua_l.head = (0.22, 0, 1.42)
    ua_l.tail = (0.32, 0, 1.18)
    ua_l.parent = sh_l

    fa_l = eb.new("Forearm.L")
    fa_l.head = (0.32, 0, 1.18)
    fa_l.tail = (0.36, 0, 0.94)
    fa_l.parent = ua_l

    h_l = eb.new("Hand.L")
    h_l.head = (0.36, 0, 0.94)
    h_l.tail = (0.38, 0, 0.82)
    h_l.parent = fa_l

    # Right Arm
    sh_r = eb.new("Shoulder.R")
    sh_r.head = (-0.08, 0, 1.44)
    sh_r.tail = (-0.22, 0, 1.42)
    sh_r.parent = chest

    ua_r = eb.new("UpperArm.R")
    ua_r.head = (-0.22, 0, 1.42)
    ua_r.tail = (-0.32, 0, 1.18)
    ua_r.parent = sh_r

    fa_r = eb.new("Forearm.R")
    fa_r.head = (-0.32, 0, 1.18)
    fa_r.tail = (-0.36, 0, 0.94)
    fa_r.parent = ua_r

    h_r = eb.new("Hand.R")
    h_r.head = (-0.36, 0, 0.94)
    h_r.tail = (-0.38, 0, 0.82)
    h_r.parent = fa_r

    # Left Leg
    th_l = eb.new("Thigh.L")
    th_l.head = (0.11, 0, 0.96)
    th_l.tail = (0.11, 0, 0.58)
    th_l.parent = hips

    calf_l = eb.new("Calf.L")
    calf_l.head = (0.11, 0, 0.58)
    calf_l.tail = (0.11, 0, 0.16)
    calf_l.parent = th_l

    ft_l = eb.new("Foot.L")
    ft_l.head = (0.11, 0, 0.16)
    ft_l.tail = (0.11, 0.12, 0.04)
    ft_l.parent = calf_l

    # Right Leg
    th_r = eb.new("Thigh.R")
    th_r.head = (-0.11, 0, 0.96)
    th_r.tail = (-0.11, 0, 0.58)
    th_r.parent = hips

    calf_r = eb.new("Calf.R")
    calf_r.head = (-0.11, 0, 0.58)
    calf_r.tail = (-0.11, 0, 0.16)
    calf_r.parent = th_r

    ft_r = eb.new("Foot.R")
    ft_r.head = (-0.11, 0, 0.16)
    ft_r.tail = (-0.11, 0.12, 0.04)
    ft_r.parent = calf_r

    # Drone Bone
    dr_b = eb.new("Drone.Bone")
    dr_b.head = (0.55, -0.28, 1.76)
    dr_b.tail = (0.55, -0.28, 1.94)
    dr_b.parent = r_bone

    bpy.ops.object.mode_set(mode='OBJECT')

    # 3. Parenting Meshes to Corresponding Bones
    bone_mesh_mapping = {
        "Head": ["Head", "Forehead_Rune", "Hair_Braided_Cap", "Ponytail_Knot", "Earring_L", "Earring_R"],
        "Ponytail.01": ["Ponytail_Seg_1"],
        "Ponytail.02": ["Ponytail_Seg_2"],
        "Ponytail.03": ["Ponytail_Seg_3"],
        "Ponytail.04": ["Ponytail_Seg_4"],
        "Neck": ["Neck"],
        "Chest": ["Cuirass", "Chest_Rune_Emblem", "Armor_Collar"],
        "Spine": ["Midriff"],
        "Hips": ["Belt_Upper", "Belt_Lower", "Belt_Buckle", "Pouch_L", "Pouch_R", "Tasset_Front", "Tasset_Side_L", "Tasset_Side_R", "Tasset_Rune_L", "Tasset_Rune_R", "Tasset_Back_L", "Tasset_Back_R"],
        "UpperArm.L": ["Pauldron_L_1", "Pauldron_L_2", "Pauldron_L_3", "UpperArm_L", "ArmBand_L"],
        "Forearm.L": ["Bracer_L", "Bracer_Rune_L"],
        "Hand.L": ["Hand_L", "Bow_Grip", "Bow_Limb_Upper", "Bow_Limb_Lower", "Bow_Blade_Upper", "Bow_Blade_Lower"],
        "UpperArm.R": ["Pauldron_R_1", "Pauldron_R_2", "Pauldron_R_3", "UpperArm_R", "ArmBand_R"],
        "Forearm.R": ["Bracer_R", "Bracer_Rune_R"],
        "Hand.R": ["Hand_R"],
        "Thigh.L": ["Thigh_L"],
        "Calf.L": ["Knee_L", "Knee_Rune_L", "Greave_L", "Shin_Rune_L"],
        "Foot.L": ["Boot_L"],
        "Thigh.R": ["Thigh_R"],
        "Calf.R": ["Knee_R", "Knee_Rune_R", "Greave_R", "Shin_Rune_R"],
        "Foot.R": ["Boot_R"],
        "Drone.Bone": ["Drone_Chassis", "Drone_Rune_Ring", "Drone_Core_Eye", "Drone_Fin_1", "Drone_Fin_2", "Drone_Fin_3"]
    }

    # 3. Add vertex groups to each mesh and join into unified skinned character
    for bname, mesh_names in bone_mesh_mapping.items():
        for mname in mesh_names:
            if mname in mesh_objects:
                mobj = mesh_objects[mname]
                vg = mobj.vertex_groups.new(name=bname)
                vg.add(range(len(mobj.data.vertices)), 1.0, 'REPLACE')

    # Join all meshes into single Heroine_Body with Armature modifier
    bpy.ops.object.select_all(action='DESELECT')
    all_objs = list(mesh_objects.values())
    for obj in all_objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = all_objs[0]
    bpy.ops.object.join()
    heroine_body = bpy.context.active_object
    heroine_body.name = "Heroine_Body"

    # Add Armature Modifier to bind mesh to the rig
    mod = heroine_body.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm_obj
    heroine_body.parent = arm_obj

    # 4. Generate 3 Complete Animation Clips (Actions)
    arm_obj.animation_data_create()
    pb = arm_obj.pose.bones
    for b in pb:
        b.rotation_mode = 'XYZ'

    def key_bone(bname, frame, loc=None, rot_deg=None, scale=None):
        if bname in pb:
            bone = pb[bname]
            if loc is not None:
                bone.location = Vector(loc)
                bone.keyframe_insert(data_path="location", frame=frame)
            if rot_deg is not None:
                bone.rotation_euler = Euler((math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2])), 'XYZ')
                bone.keyframe_insert(data_path="rotation_euler", frame=frame)
            if scale is not None:
                bone.scale = Vector(scale)
                bone.keyframe_insert(data_path="scale", frame=frame)

    # --- ACTION 1: IDLE (60 Frames / 2.0s Loop) ---
    idle_act = bpy.data.actions.new("Idle")
    arm_obj.animation_data.action = idle_act

    for frame, pct in [(1, 0.0), (30, 1.0), (60, 0.0)]:
        # Breathing chest expansion
        breathe_rot = pct * 3.5
        breathe_y = pct * 0.012
        key_bone("Chest", frame, rot_deg=(breathe_rot, 0, 0))
        key_bone("Hips", frame, loc=(0, 0, -breathe_y * 0.5))
        key_bone("Head", frame, rot_deg=(-breathe_rot * 0.5, 0, 0))

        # Ponytail gentle sway
        key_bone("Ponytail.01", frame, rot_deg=(-10 + pct * 4, 0, 0))
        key_bone("Ponytail.02", frame, rot_deg=(-8 + pct * 6, 0, 0))
        key_bone("Ponytail.03", frame, rot_deg=(-6 + pct * 8, 0, 0))

        # Arms relaxed tactical stance
        key_bone("UpperArm.L", frame, rot_deg=(12 + pct * 2, 8, -14))
        key_bone("Forearm.L", frame, rot_deg=(24 + pct * 3, 0, 12))
        key_bone("UpperArm.R", frame, rot_deg=(8 - pct * 2, -6, 12))
        key_bone("Forearm.R", frame, rot_deg=(20 - pct * 2, 0, -10))

        # Drone floating hover oscillation
        key_bone("Drone.Bone", frame, loc=(0, 0, math.sin(pct * math.pi) * 0.06), rot_deg=(pct * 4, pct * 8, pct * 15))

    track_idle = arm_obj.animation_data.nla_tracks.new()
    track_idle.name = "Idle"
    track_idle.strips.new("Idle", 1, idle_act)

    # --- ACTION 2: RUN (24 Frames / 0.8s Loop) ---
    run_act = bpy.data.actions.new("Run")
    arm_obj.animation_data.action = run_act

    # 4 Key poses: Contact 1 (F1), Passing 1 (F7), Contact 2 (F13), Passing 2 (F19), Loop (F25)
    run_frames = [1, 7, 13, 19, 25]
    for idx, frame in enumerate(run_frames):
        phase = (frame - 1) / 24.0
        sin_p = math.sin(phase * 2 * math.pi)
        cos_p = math.cos(phase * 2 * math.pi)

        # Forward athletic lean & bounce
        key_bone("Hips", frame, loc=(0, 0, -abs(sin_p) * 0.04), rot_deg=(-12, sin_p * 8, 0))
        key_bone("Chest", frame, rot_deg=(-6, -sin_p * 10, 0))
        key_bone("Head", frame, rot_deg=(8, 0, 0))

        # Wind-blown hair ponytail
        key_bone("Ponytail.01", frame, rot_deg=(-35 + sin_p * 5, 0, cos_p * 6))
        key_bone("Ponytail.02", frame, rot_deg=(-30 + sin_p * 6, 0, cos_p * 8))
        key_bone("Ponytail.03", frame, rot_deg=(-24 + sin_p * 8, 0, cos_p * 10))

        # Leg strides (alternating thighs and calves)
        l_thigh = sin_p * 42
        r_thigh = -sin_p * 42
        l_calf = max(0, -sin_p * 55)
        r_calf = max(0, sin_p * 55)

        key_bone("Thigh.L", frame, rot_deg=(l_thigh, 0, 0))
        key_bone("Calf.L", frame, rot_deg=(-l_calf, 0, 0))
        key_bone("Foot.L", frame, rot_deg=(l_thigh * 0.4, 0, 0))

        key_bone("Thigh.R", frame, rot_deg=(r_thigh, 0, 0))
        key_bone("Calf.R", frame, rot_deg=(-r_calf, 0, 0))
        key_bone("Foot.R", frame, rot_deg=(r_thigh * 0.4, 0, 0))

        # Counterbalanced arm pump
        key_bone("UpperArm.L", frame, rot_deg=(-sin_p * 35, 10, -18))
        key_bone("Forearm.L", frame, rot_deg=(35 - sin_p * 20, 0, 10))
        key_bone("UpperArm.R", frame, rot_deg=(sin_p * 35, -10, 18))
        key_bone("Forearm.R", frame, rot_deg=(35 + sin_p * 20, 0, -10))

        # Drone banking forward with player speed
        key_bone("Drone.Bone", frame, loc=(0, -0.15, sin_p * 0.05), rot_deg=(-20, sin_p * 10, 0))

    track_run = arm_obj.animation_data.nla_tracks.new()
    track_run.name = "Run"
    track_run.strips.new("Run", 1, run_act)

    # --- ACTION 3: SHOOT (20 Frames / 0.65s Shot & Recoil) ---
    shoot_act = bpy.data.actions.new("Shoot")
    arm_obj.animation_data.action = shoot_act

    # F1 (Aim/Draw start) -> F8 (Full draw tension) -> F9 (Release / Snap) -> F20 (Recover)
    shoot_keyframes = [
        (1, 0.0),    # Neutral aim
        (8, 1.0),    # Full string draw
        (9, 1.1),    # Instant release snap
        (13, 0.4),   # Spring recoil dampening
        (20, 0.0)    # Return to ready
    ]

    for frame, draw in shoot_keyframes:
        if frame == 9:
            # Sudden release recoil kick
            key_bone("UpperArm.L", frame, rot_deg=(85, 14, -20))
            key_bone("Forearm.L", frame, rot_deg=(12, 0, 8))
            key_bone("UpperArm.R", frame, rot_deg=(25, -25, 38))
            key_bone("Forearm.R", frame, rot_deg=(55, 0, -20))
            key_bone("Chest", frame, rot_deg=(4, -14, 0))
            key_bone("Drone.Bone", frame, loc=(0, 0, 0.08), rot_deg=(-10, 0, 20))
        else:
            # Drawing back arrow & aiming bow towards horizon
            aim_raise = draw * 75
            pull_back = draw * 58
            key_bone("UpperArm.L", frame, rot_deg=(aim_raise, 12, -15))
            key_bone("Forearm.L", frame, rot_deg=(18, 0, 10))

            key_bone("UpperArm.R", frame, rot_deg=(pull_back * 0.8, -pull_back * 0.4, 25))
            key_bone("Forearm.R", frame, rot_deg=(pull_back * 1.4, 0, -15))

            key_bone("Chest", frame, rot_deg=(-2, draw * 18, 0))
            key_bone("Hips", frame, rot_deg=(-4, draw * 8, 0))
            key_bone("Drone.Bone", frame, loc=(0, draw * -0.05, draw * 0.04), rot_deg=(draw * 12, 0, 0))

    track_shoot = arm_obj.animation_data.nla_tracks.new()
    track_shoot.name = "Shoot"
    track_shoot.strips.new("Shoot", 1, shoot_act)

    # Reset active action to Idle for default display in Blender
    arm_obj.animation_data.action = idle_act

    # 5. Save .blend file
    blend_path = os.path.abspath("models/heroine_aria.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"RIGGED_BLEND_SAVED: {blend_path}")

    # 6. Export .glb with full skeletal animations
    glb_path = os.path.abspath("models/heroine_aria.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_animations=True,
        export_nla_strips=True,
        export_materials='EXPORT'
    )
    print(f"RIGGED_GLB_EXPORTED: {glb_path}")

if __name__ == "__main__":
    create_heroine_rigged()

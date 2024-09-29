#import noisy_bevy::{simplex_noise_2d, simplex_noise_3d}

#import "shaders/util_functions.wgsl"::remap;


const TEXTURE_PARAMS_A = SandTextureParams(vec2(0.01), vec2(0.7, 0.9));
const TEXTURE_PARAMS_B = SandTextureParams(vec2(0.01), vec2(0.7, 0.9));
const TEXTURE_PARAMS_C = SandTextureParams(vec2(0.02), vec2(0.9));
const TEXTURE_PARAMS_D = SandTextureParams(vec2(0.02), vec2(0.9));
const TEXTURE_PARAMS_E = SandTextureParams(vec2(0.02), vec2(0.9));


struct SandTextureConstants {
    scale: f32,
    padding: vec3<u32>,
    main_color: vec4<f32>,
    texture_color_a: vec4<f32>,
    texture_color_b: vec4<f32>,
    texture_color_c: vec4<f32>,
    texture_color_d: vec4<f32>,
    texture_color_e: vec4<f32>
}

struct SandTextureVariables {
    depth_a: f32,
    depth_b: f32,
    depth_c: f32,
    depth_d: f32,
    depth_e: f32,
    padding: vec3<u32>
}

struct SandTextureParams {
    sample_multiplier: vec2<f32>,
    threshold: vec2<f32>,
}


@group(2) @binding(200) var<uniform> constants: SandTextureConstants;
@group(2) @binding(201) var<uniform> variables: SandTextureVariables;


fn add_texture(
    input_color: vec3<f32>,
    input_position: vec2<f32>,
    texture_params: SandTextureParams,
    texture_color: vec4<f32>,
    depth: f32
) -> vec3<f32> {
    let mask = texture_color.a * smoothstep(
        texture_params.threshold.x,
        texture_params.threshold.y,
        remap(-1f, 1f, 0f, 1f, simplex_noise_3d(vec3(input_position * texture_params.sample_multiplier, depth)))
    );

    return mix(input_color, texture_color.rgb, mask);
}

fn calculate_sand_texture(input_position: vec2<f32>) -> vec4<f32> {
    var sand_texture = constants.main_color.rgb;
    sand_texture = add_texture(sand_texture, input_position, TEXTURE_PARAMS_A, constants.texture_color_a, variables.depth_a);
    sand_texture = add_texture(sand_texture, input_position, TEXTURE_PARAMS_B, constants.texture_color_b, variables.depth_b);
    sand_texture = add_texture(sand_texture, input_position, TEXTURE_PARAMS_C, constants.texture_color_c, variables.depth_c);
    sand_texture = add_texture(sand_texture, input_position, TEXTURE_PARAMS_D, constants.texture_color_d, variables.depth_d);
    sand_texture = add_texture(sand_texture, input_position, TEXTURE_PARAMS_E, constants.texture_color_e, variables.depth_e);
    return vec4(sand_texture, constants.main_color.a);
}
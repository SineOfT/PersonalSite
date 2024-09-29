#import noisy_bevy::{simplex_noise_2d, simplex_noise_3d}

#import "shaders/custom_vertex_shader.wgsl"::VertexOutput
#import "shaders/util_functions.wgsl"::remap
#import "shaders/decorations/sand_texture.wgsl"::calculate_sand_texture


const WAVE_SAMPLE_MULTIPLIER = 0.003f;


struct Constants {
    border_width: f32,
    wave_amplitude: f32,
    border_color: vec4<f32>,
    padding: vec2<u32>
}

struct Variables {
    wave_depth: f32,
    padding: vec3<u32>
}


@group(2) @binding(0) var<uniform> constants: Constants;
@group(2) @binding(1) var<uniform> variables: Variables;


fn add_waves(input_position: vec2<f32>) -> vec2<f32> {
    return vec2(
        input_position.x,
        input_position.y - constants.wave_amplitude
            * remap(-1f, 1f, 0f, 1f, simplex_noise_2d(vec2(input_position.x * WAVE_SAMPLE_MULTIPLIER, variables.wave_depth)))
    );
}

@fragment fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    var sand_position = in.position;
    sand_position = add_waves(sand_position);
    
    if sand_position.y < 0f { return vec4(0f); }

    let sand_texture = calculate_sand_texture(sand_position);
    let sand_color = mix(sand_texture, constants.border_color, step(0f, constants.border_width - sand_position.y));

    return sand_color;
}
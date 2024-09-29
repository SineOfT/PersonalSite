#import noisy_bevy::simplex_noise_3d

#import "shaders/custom_vertex_shader.wgsl"::VertexOutput
#import "shaders/sand_shader.wgsl"::calculate_sand_color
#import "shaders/util_functions.wgsl"::{remap, add_depth_perspective}
#import "shaders/decorations/surface_highlight_texture.wgsl"::calculate_highlight_texture
#import "shaders/decorations/sand_texture.wgsl"::calculate_sand_texture


const WAVE_SAMPLE_MULTIPLIER = vec2(0.5f, 0.5f);
const WAVE_AMPLITUDE = 2f;

const FADE_TRANSPARENCY_HEIGHT = 0.3f;
const OCEAN_FADE_HEIGHT = 0.2f;


struct Constants {
    ocean_color: vec4<f32>,
    highlight_color: vec4<f32>
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
        input_position.y - WAVE_AMPLITUDE
            * remap(-1f, 1f, 0f, 1f, simplex_noise_3d(vec3(input_position * WAVE_SAMPLE_MULTIPLIER, variables.wave_depth)))
            * (1f - input_position.y)
    );
}


@fragment fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    var surface_position = in.position;
    surface_position = add_depth_perspective(surface_position);
    surface_position = add_waves(surface_position);
    let sand_position = surface_position / in.scale;

    var highlight_texture = calculate_highlight_texture(surface_position, constants.highlight_color);
    highlight_texture *= smoothstep(FADE_TRANSPARENCY_HEIGHT, 0f, FADE_TRANSPARENCY_HEIGHT - (1f - in.position.y));

    var sand_texture = calculate_sand_texture(sand_position);
    sand_texture = mix(constants.ocean_color, sand_texture, smoothstep(0f, OCEAN_FADE_HEIGHT, (1f - in.position.y)));

    var sand_color = vec4(mix(sand_texture.rgb, highlight_texture.rgb, highlight_texture.a), sand_texture.a);

    return sand_color;
}
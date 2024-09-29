#import noisy_bevy::{simplex_noise_2d, simplex_noise_2d_seeded, simplex_noise_3d}

#import "shaders/custom_vertex_shader.wgsl"::VertexOutput
#import "shaders/util_functions.wgsl"::{remap, overlay, add_depth_perspective}
#import "shaders/decorations/surface_highlight_texture.wgsl"::calculate_highlight_texture


const PI = radians(180f);

const HIGHLIGHT_BORDER_WIDTH = 0.1f;

const SURFACE_SAMPLE_MULTIPLIER = vec2(5f, 5f);
const SURFACE_DISPLACEMENT_MULTIPLIER = vec2(0.01f, 0.01f);

const WAVE_SAMPLE_MULTIPLIER = vec2(0.5f, 0.5f);

const FADE_TRANSPARENCY_HEIGHT = 0.5f;
const OCEAN_FADE_MINMAX = vec2(0.5f, 1f);


struct Constants {
    wave_amplitude: f32,
    padding: vec3<u32>,
    ocean_color: vec4<f32>,
    highlight_color: vec4<f32>,
    border_color: vec4<f32>
}

struct Variables {
    surface_depths: vec2<f32>,
    wave_depth: f32,
    padding: u32
}


@group(2) @binding(0) var<uniform> constants: Constants;
@group(2) @binding(1) var<uniform> variables: Variables;


fn add_surface_displacement(input_position: vec2<f32>) -> vec2<f32> {
    return input_position + SURFACE_DISPLACEMENT_MULTIPLIER * vec2(
        simplex_noise_3d(vec3(input_position * SURFACE_SAMPLE_MULTIPLIER, variables.surface_depths.x)),
        simplex_noise_3d(vec3(input_position * SURFACE_SAMPLE_MULTIPLIER, variables.surface_depths.y))
    );
}

fn add_waves(input_position: vec2<f32>) -> vec2<f32> {
    return vec2(
        input_position.x,
        input_position.y - constants.wave_amplitude
            * remap(-1f, 1f, 0f, 1f, simplex_noise_3d(vec3(input_position * WAVE_SAMPLE_MULTIPLIER, variables.wave_depth)))
            * (1f - input_position.y)
    );
}


@fragment fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    var surface_position = in.position;
    surface_position = add_depth_perspective(surface_position);
    surface_position = add_surface_displacement(surface_position);
    surface_position = add_waves(surface_position);

    if surface_position.y < 0f { return vec4(0f); }

    var highlight_texture = calculate_highlight_texture(surface_position, constants.highlight_color);
    highlight_texture.a *= smoothstep(FADE_TRANSPARENCY_HEIGHT, 0f, FADE_TRANSPARENCY_HEIGHT - (1f - in.position.y));
    highlight_texture = mix(highlight_texture, constants.border_color, step(0f, HIGHLIGHT_BORDER_WIDTH - surface_position.y));

    var color = constants.ocean_color;
    color.a *= mix(OCEAN_FADE_MINMAX.x, OCEAN_FADE_MINMAX.y, in.position.y);
    color = mix(color, vec4(highlight_texture.rgb, 1f), highlight_texture.a);

    return color;
}
#import noisy_bevy::simplex_noise_3d

#import "shaders/custom_vertex_shader.wgsl"::VertexOutput
#import "shaders/util_functions.wgsl"::{remap, umix, rand};


const SPRITE_SIZE = vec2(640f, 128f);
const SPRITE_ROW_COUNT = 32u;
const SPRITE_POSITIVE_FRAMES = SpriteFrames(
    24u,
    (1u << 0u) +
    (1u << 1u) +
    (1u << 2u) +
    (1u << 3u) +
    (1u << 4u) +
    (1u << 5u) +
    (1u << 6u) +
    (1u << 7u) +
    (1u << 8u) +
    (1u << 9u) +
    (1u << 10u) +
    (1u << 11u) +
    (1u << 12u) +
    (1u << 13u) +
    (1u << 14u) +
    (1u << 15u) +
    (1u << 16u) +
    (1u << 17u) +
    (1u << 18u) +
    (1u << 19u) +
    (1u << 20u) +
    (1u << 21u) +
    (1u << 22u) +
    (1u << 23u),
);
const SPRITE_NEGATIVE_FRAMES = SpriteFrames(
    16u,
    (1u << 0u) +
    (1u << 1u) +
    (1u << 2u) +
    (1u << 3u) +
    (1u << 4u) +
    (1u << 5u) +
    (1u << 6u) +
    (1u << 7u) +
    (1u << 24u) +
    (1u << 25u) +
    (1u << 26u) +
    (1u << 27u) +
    (1u << 28u) +
    (1u << 29u) +
    (1u << 30u) +
    (1u << 31u)
);

const CURRENT_SAMPLE_MULTIPLIER = vec2(0.0005f, 0.01f);
const DIRECTION_SAMPLE_MULTIPLIER = vec2(0.0001f, 0.0001f);

const MAX_CURRENT_GRADIENT = 0.05f;
const MAX_TEXTURE_GRADIENT = 0.05f;


struct SpriteFrames {
    count: u32,
    mask: u32
}

struct Constants {
    primary_color: vec4<f32>,
    secondary_color: vec4<f32>,
    sprite_color: vec4<f32>,
    current_offset_speeds: vec3<f32>,
    padding: u32
}

struct Variables {
    left_current_offset: vec3<f32>,
    sprite_offset: f32,
    right_current_offset: vec3<f32>,
    direction_depth: f32
}


const GRADIENT_DELTA_TIME: f32 = 0.01;
const MAX_NOISE_POSITION: f32 = 1000.;


@group(2) @binding(0) var<uniform> constants: Constants;
@group(2) @binding(1) var<uniform> variables: Variables;
@group(2) @binding(2) var current_spritesheet: texture_2d<f32>;
@group(2) @binding(3) var current_texture_sampler: sampler;


fn calculate_gradient(position: vec2<f32>, direction: f32) -> vec2<f32> {
    let is_right = step(0f, direction);
    let current_depth = mix(variables.left_current_offset.z, variables.right_current_offset.z, is_right);
    let curr_noise_position = vec3(position * CURRENT_SAMPLE_MULTIPLIER, current_depth);
    let curr_noise_value = simplex_noise_3d(curr_noise_position);

    let current_velocities = vec3(constants.current_offset_speeds.x * direction, constants.current_offset_speeds.yz);
    let prev_noise_position = curr_noise_position - GRADIENT_DELTA_TIME * current_velocities;
    let prev_noise_value = simplex_noise_3d(prev_noise_position);

    let gradient = (curr_noise_value - prev_noise_value) * sign(curr_noise_value) / GRADIENT_DELTA_TIME;
    return vec2(gradient, curr_noise_value);
}

fn calculate_current_color(input_position: vec2<f32>, direction: f32) -> vec4<f32> {
    let is_right = step(0f, direction);

    let anchor_position_y = floor(input_position.y / SPRITE_SIZE.y) * SPRITE_SIZE.y;
    let offset_x = rand(anchor_position_y) + variables.sprite_offset * direction;
    let anchor_position_x = (floor(input_position.x / SPRITE_SIZE.x + offset_x) - offset_x) * SPRITE_SIZE.x;
    let anchor_position = vec2(anchor_position_x, anchor_position_y);
    let center_position = anchor_position + SPRITE_SIZE / 2f;

    let current_gradient = calculate_gradient(center_position, direction);
    let texture_gradient = calculate_gradient(input_position, direction);

    let current_opacity = smoothstep(0f, 1f, saturate(current_gradient.x / MAX_CURRENT_GRADIENT));
    let texture_opacity = smoothstep(0f, 1f, saturate(texture_gradient.x / MAX_TEXTURE_GRADIENT));

    let current_t = u32(step(0f, current_gradient.y));
    let current_frame_count = umix(SPRITE_POSITIVE_FRAMES.count, SPRITE_NEGATIVE_FRAMES.count, current_t);
    let current_frame_mask  = umix(SPRITE_POSITIVE_FRAMES.mask,  SPRITE_NEGATIVE_FRAMES.mask,  current_t);
    let current_index = clamp(u32(trunc(abs(current_gradient.y) * f32(current_frame_count))), 0u, current_frame_count - 1u);
    var current_spritesheet_index: u32;
    var mask_count = 0u;
    for (var i = 0u; i < SPRITE_ROW_COUNT; i++) {
        mask_count += ((1u << i) & current_frame_mask) >> i;
        if mask_count >= current_index {
            current_spritesheet_index = i;
            break;
        }
    }

    let current_uv = (input_position - anchor_position) / SPRITE_SIZE;
    let current_spritesheet_uv = vec2(
        mix(current_uv.x, (1f - current_uv.x), is_right),
        (current_uv.y + f32(current_spritesheet_index)) / f32(SPRITE_ROW_COUNT)
    );

    let current_sprite = textureSample(current_spritesheet, current_texture_sampler, current_spritesheet_uv);
    let current_color = mix(
        mix(constants.primary_color, constants.secondary_color, texture_opacity),
        vec4(current_sprite.rbg, 1f) * constants.sprite_color,
        current_sprite.a * current_opacity
    );

    return current_color;
}

fn calculate_direction_t(input_position: vec2<f32>) -> f32 {
    let direction_position = vec3(input_position * DIRECTION_SAMPLE_MULTIPLIER, variables.direction_depth);
    let direction_value = simplex_noise_3d(direction_position);
    let direction_t = smoothstep(0.25f, 0.75f, remap(-1f, 1f, 0f, 1f, direction_value));
    return direction_t;
}

@fragment fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let left_current_color = calculate_current_color(in.position, -1f);
    let right_current_color = calculate_current_color(in.position, 1f);
    let direction_t = calculate_direction_t(in.position);

    let output_color = mix(left_current_color, right_current_color, direction_t);

    return output_color;
}
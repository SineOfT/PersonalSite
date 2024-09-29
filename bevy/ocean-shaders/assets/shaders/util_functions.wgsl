const PI = radians(180f);
const DEPTH_VIEW_ANGLE_MINMAX = vec2(0.25f*PI, 0.48f*PI);


fn remap(from_min: f32, from_max: f32, to_min: f32, to_max: f32, value: f32) -> f32 {
    return (value - from_min) * (to_max - to_min) / (from_max - from_min) + to_min;
}
fn remap_2d(from_min: f32, from_max: f32, to_min: f32, to_max: f32, value: vec2<f32>) -> vec2<f32> {
    return vec2(
        remap(from_min, from_max, to_min, to_max, value.x),
        remap(from_min, from_max, to_min, to_max, value.y)
    );
}
fn remap_3d(from_min: f32, from_max: f32, to_min: f32, to_max: f32, value: vec3<f32>) -> vec3<f32> {
    return vec3(
        remap(from_min, from_max, to_min, to_max, value.x),
        remap(from_min, from_max, to_min, to_max, value.y),
        remap(from_min, from_max, to_min, to_max, value.z)
    );
}

fn umix(a: u32, b: u32, t: u32) -> u32 { return a * (1u-t) + b * t; }

fn overlay(texture_a: vec4<f32>, texture_b: vec4<f32>) -> vec4<f32> {
    return vec4(mix(texture_a.rgb, texture_b.rgb, texture_b.a), saturate(texture_a.a + texture_b.a));
}

fn rotation_mat2x2(angle: f32) -> mat2x2<f32> {
    return mat2x2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

fn rand(value: f32) -> f32 { return fract(cos(value * 0.01f) * 23348.23489f); }
fn rand_2d(value: vec2<f32>) -> f32 { return rand(dot(value, vec2(123984.1238f, 2384.1234f))); }

fn add_depth_perspective(normalized_position: vec2<f32>) -> vec2<f32> {
    return vec2(
        normalized_position.x,
        tan(remap(0f, 1f, DEPTH_VIEW_ANGLE_MINMAX.x, DEPTH_VIEW_ANGLE_MINMAX.y, normalized_position.y)) -
        tan(DEPTH_VIEW_ANGLE_MINMAX.x)
    );
}
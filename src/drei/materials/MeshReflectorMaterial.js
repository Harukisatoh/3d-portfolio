import { MeshStandardMaterial } from "three";
import { extend } from "@react-three/fiber";

export class MeshReflectorMaterial extends MeshStandardMaterial {
  _debug = { value: 0 };
  _tDepth = { value: null };
  _distortionMap = { value: null };
  _tDiffuse = { value: null };
  _tDiffuseBlur = { value: null };
  _textureMatrix = { value: null };
  _hasBlur = { value: false };
  _mirror = { value: 0.0 };
  _mixBlur = { value: 0.0 };
  _blurStrength = { value: 0.5 };
  _minDepthThreshold = { value: 0.9 };
  _maxDepthThreshold = { value: 1 };
  _depthScale = { value: 0 };
  _depthToBlurRatioBias = { value: 0.25 };
  _distortion = { value: 1 };
  _mixContrast = { value: 1.0 };

  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
  }
  onBeforeCompile(shader) {
    if (!shader.defines?.USE_UV) {
      shader.defines.USE_UV = "";
    }
    shader.uniforms.debug = this._debug;
    shader.uniforms.hasBlur = this._hasBlur;
    shader.uniforms.tDiffuse = this._tDiffuse;
    shader.uniforms.tDepth = this._tDepth;
    shader.uniforms.distortionMap = this._distortionMap;
    shader.uniforms.tDiffuseBlur = this._tDiffuseBlur;
    shader.uniforms.textureMatrix = this._textureMatrix;
    shader.uniforms.mirror = this._mirror;
    shader.uniforms.mixBlur = this._mixBlur;
    shader.uniforms.mixStrength = this._blurStrength;
    shader.uniforms.minDepthThreshold = this._minDepthThreshold;
    shader.uniforms.maxDepthThreshold = this._maxDepthThreshold;
    shader.uniforms.depthScale = this._depthScale;
    shader.uniforms.depthToBlurRatioBias = this._depthToBlurRatioBias;
    shader.uniforms.distortion = this._distortion;
    shader.uniforms.mixContrast = this._mixContrast;
    shader.vertexShader = `
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;     
      ${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`
    );

    shader.fragmentShader = `
      uniform int debug;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv; 

      #define STANDARD
      #ifdef PHYSICAL
        #define IOR
        #define SPECULAR
      #endif
      uniform vec3 diffuse;
      uniform vec3 emissive;
      uniform float roughness;
      uniform float metalness;
      uniform float opacity;
      #ifdef IOR
        uniform float ior;
      #endif
      #ifdef SPECULAR
        uniform float specularIntensity;
        uniform vec3 specularColor;
        #ifdef USE_SPECULARINTENSITYMAP
          uniform sampler2D specularIntensityMap;
        #endif
        #ifdef USE_SPECULARCOLORMAP
          uniform sampler2D specularColorMap;
        #endif
      #endif
      #ifdef USE_CLEARCOAT
        uniform float clearcoat;
        uniform float clearcoatRoughness;
      #endif
      #ifdef USE_SHEEN
        uniform vec3 sheenColor;
        uniform float sheenRoughness;
        #ifdef USE_SHEENCOLORMAP
          uniform sampler2D sheenColorMap;
        #endif
        #ifdef USE_SHEENROUGHNESSMAP
          uniform sampler2D sheenRoughnessMap;
        #endif
      #endif
      varying vec3 vViewPosition;
      #include <common>
      #include <packing>
      #include <dithering_pars_fragment>
      #include <color_pars_fragment>
      #include <uv_pars_fragment>
      #include <uv2_pars_fragment>
      #include <map_pars_fragment>
      #include <alphamap_pars_fragment>
      #include <alphatest_pars_fragment>
      #include <aomap_pars_fragment>
      #include <lightmap_pars_fragment>
      #include <emissivemap_pars_fragment>
      #include <bsdfs>
      #include <cube_uv_reflection_fragment>
      #include <envmap_common_pars_fragment>
      #include <envmap_physical_pars_fragment>
      #include <fog_pars_fragment>
      #include <lights_pars_begin>
      #include <normal_pars_fragment>
      #include <lights_physical_pars_fragment>
      #include <transmission_pars_fragment>
      #include <shadowmap_pars_fragment>
      #include <bumpmap_pars_fragment>
      #include <normalmap_pars_fragment>
      #include <clearcoat_pars_fragment>
      #include <roughnessmap_pars_fragment>
      #include <metalnessmap_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>
      void main() {
        #include <clipping_planes_fragment>
        vec4 diffuseColor = vec4(0.0);
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <roughnessmap_fragment>
        #include <metalnessmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <clearcoat_normal_fragment_begin>
        #include <clearcoat_normal_fragment_maps>
        #include <emissivemap_fragment>

        float distortionFactor = 0.0;
        #ifdef USE_DISTORTION
          distortionFactor = texture2D(distortionMap, vUv).r * distortion;
        #endif
  
        vec4 new_vUv = my_vUv;
        new_vUv.x += distortionFactor;
        new_vUv.y += distortionFactor;
  
        vec4 base = texture2DProj(tDiffuse, new_vUv);
        vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);
        
        vec4 merge = base;
        
        #ifdef USE_NORMALMAP
          vec2 normal_uv = vec2(0.0);
          vec4 normalColor = texture2D(normalMap, vUv * normalScale);
          vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
          vec3 coord = new_vUv.xyz / new_vUv.w;
          normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
          vec4 base_normal = texture2D(tDiffuse, normal_uv);
          vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
          merge = base_normal;
          blur = blur_normal;
        #endif
  
        float depthFactor = 0.0001;
        float blurFactor = 0.0;
  
        #ifdef USE_DEPTH
          vec4 depth = texture2DProj(tDepth, new_vUv);
          depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
          depthFactor *= depthScale;
          depthFactor = max(0.0001, min(1.0, depthFactor));
  
          #ifdef USE_BLUR
            blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
            merge = merge * min(1.0, depthFactor + 0.5);
          #else
            merge = merge * depthFactor;
          #endif
    
        #endif
  
        float reflectorRoughnessFactor = roughness;
        #ifdef USE_ROUGHNESSMAP
          vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
          reflectorRoughnessFactor *= reflectorTexelRoughness.g;
        #endif
        
        #ifdef USE_BLUR
          blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
          merge = mix(merge, blur, blurFactor);
        #endif
  
        diffuseColor.r = (merge.r - 0.5) * mixContrast + 0.5;
        diffuseColor.g = (merge.g - 0.5) * mixContrast + 0.5;
        diffuseColor.b = (merge.b - 0.5) * mixContrast + 0.5;
        diffuseColor.a = max(max(diffuseColor.r, diffuseColor.g), diffuseColor.b);

        #include <aomap_fragment>
        vec3 totalDiffuse = diffuseColor.rgb;
        #include <transmission_fragment>
        vec3 outgoingLight = totalDiffuse + totalEmissiveRadiance;
        #ifdef USE_CLEARCOAT
          float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
          vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
          outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
        #endif
        gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity);
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
      }`;
  }
  get tDiffuse() {
    return this._tDiffuse.value;
  }
  set tDiffuse(v) {
    this._tDiffuse.value = v;
  }
  get tDepth() {
    return this._tDepth.value;
  }
  set tDepth(v) {
    this._tDepth.value = v;
  }
  get distortionMap() {
    return this._distortionMap.value;
  }
  set distortionMap(v) {
    this._distortionMap.value = v;
  }
  get tDiffuseBlur() {
    return this._tDiffuseBlur.value;
  }
  set tDiffuseBlur(v) {
    this._tDiffuseBlur.value = v;
  }
  get textureMatrix() {
    return this._textureMatrix.value;
  }
  set textureMatrix(v) {
    this._textureMatrix.value = v;
  }
  get hasBlur() {
    return this._hasBlur.value;
  }
  set hasBlur(v) {
    this._hasBlur.value = v;
  }
  get mirror() {
    return this._mirror.value;
  }
  set mirror(v) {
    this._mirror.value = v;
  }
  get mixBlur() {
    return this._mixBlur.value;
  }
  set mixBlur(v) {
    this._mixBlur.value = v;
  }
  get mixStrength() {
    return this._blurStrength.value;
  }
  set mixStrength(v) {
    this._blurStrength.value = v;
  }
  get minDepthThreshold() {
    return this._minDepthThreshold.value;
  }
  set minDepthThreshold(v) {
    this._minDepthThreshold.value = v;
  }
  get maxDepthThreshold() {
    return this._maxDepthThreshold.value;
  }
  set maxDepthThreshold(v) {
    this._maxDepthThreshold.value = v;
  }
  get depthScale() {
    return this._depthScale.value;
  }
  set depthScale(v) {
    this._depthScale.value = v;
  }
  get debug() {
    return this._debug.value;
  }
  set debug(v) {
    this._debug.value = v;
  }
  get depthToBlurRatioBias() {
    return this._depthToBlurRatioBias.value;
  }
  set depthToBlurRatioBias(v) {
    this._depthToBlurRatioBias.value = v;
  }
  get distortion() {
    return this._distortion.value;
  }
  set distortion(v) {
    this._distortion.value = v;
  }
  get mixContrast() {
    return this._mixContrast.value;
  }
  set mixContrast(v) {
    this._mixContrast.value = v;
  }
}

extend({ MeshReflectorMaterialImpl: MeshReflectorMaterial });

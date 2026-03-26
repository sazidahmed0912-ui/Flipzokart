export const VS = `
attribute vec2 a;
void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`;

export const FS = `
precision highp float;
uniform vec2  uR;
uniform float uT, uS, uSc, uBl;
uniform vec3  uBg;
#define PI 3.14159265359
#define MARCH_STEPS 16
#define REFINE_STEPS 3

float sat(float x){return clamp(x,0.0,1.0);}
float smoother(float x){x=sat(x);return x*x*x*(x*(x*6.0-15.0)+10.0);}

vec3 sCol(vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 c4){
  int si=int(uSc);vec3 a=c0,b=c1;
  if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}
  return mix(a,b,uBl);
}
float sF(float c0,float c1,float c2,float c3,float c4){
  int si=int(uSc);float a=c0,b=c1;
  if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}
  return mix(a,b,uBl);
}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float waveH(vec2 p,float t,float amp,float storm){
  float h=0.0;
  vec2 s1=normalize(vec2(1.0,0.28)),s2=normalize(vec2(-0.48,0.88)),s3=normalize(vec2(0.82,-0.16));
  s2=rot(storm*0.18)*s2;s3=rot(-storm*0.14)*s3;
  float d1=dot(p,s1),d2=dot(p,s2),d3=dot(p,s3);
  h+=amp*0.66*sin(d1*0.42+t*0.38);h+=amp*0.22*sin(d1*0.94-t*0.62);
  h+=amp*0.14*sin(d2*1.18-t*0.82);h+=amp*0.09*sin(d3*1.82+t*1.04);
  h+=amp*(0.11+storm*0.07)*sin(p.x*1.45-t*0.76+p.y*0.66);
  h+=amp*(0.07+storm*0.05)*sin(p.x*2.85+t*1.06-p.y*0.52);
  h+=amp*(0.04+storm*0.03)*sin(p.x*4.60-t*1.50+p.y*1.02);
  float micro=noise(p*14.0+vec2(t*0.18,t*0.06))-0.5;
  h+=micro*amp*(0.010+storm*0.008);
  return h;
}
vec3 waveNorm(vec2 p,float t,float amp,float storm){
  float e=0.018;
  return normalize(vec3(-(waveH(p+vec2(e,0),t,amp,storm)-waveH(p-vec2(e,0),t,amp,storm))/(2.0*e),1.0,
                        -(waveH(p+vec2(0,e),t,amp,storm)-waveH(p-vec2(0,e),t,amp,storm))/(2.0*e)));
}
float starField(vec2 uv){
  vec2 gv=floor(uv),lv=fract(uv)-0.5;
  float h=hash(gv),sz=mix(0.012,0.0025,h);
  float d=length(lv+vec2(hash(gv+3.1)-0.5,hash(gv+7.3)-0.5)*0.25);
  return smoothstep(sz,0.0,d)*smoothstep(0.82,1.0,h);
}
void main(){
  vec2 uv=(gl_FragCoord.xy-uR*0.5)/uR.y;
  float s=smoother(uS);
  float camY=mix(1.14,1.03,s)+sin(s*PI*1.4)*0.028;
  float pitch=mix(0.115,0.088,s);
  vec3 ro=vec3(0.0,camY,mix(0.08,-0.18,s));
  vec3 rd=normalize(vec3(uv.x,uv.y-pitch,-1.4));
  float storm=smoothstep(0.80,1.0,s),night=smoothstep(0.56,0.84,s);

  vec3 skyTop =sCol(vec3(0.18,0.06,0.24),vec3(0.05,0.24,0.68),vec3(0.26,0.06,0.04),vec3(0.01,0.01,0.05),vec3(0.04,0.05,0.09));
  vec3 skyHori=sCol(vec3(0.92,0.48,0.18),vec3(0.42,0.62,0.90),vec3(0.88,0.32,0.04),vec3(0.03,0.05,0.14),vec3(0.15,0.17,0.23));
  vec3 sunCol =sCol(vec3(1.0,0.62,0.22),vec3(1.0,0.96,0.80),vec3(1.0,0.38,0.05),vec3(0.70,0.75,0.94),vec3(0.26,0.28,0.34));
  vec3 seaDeep=sCol(vec3(0.08,0.05,0.12),vec3(0.03,0.14,0.34),vec3(0.10,0.06,0.04),vec3(0.00,0.01,0.03),vec3(0.03,0.04,0.07));
  vec3 seaShlo=sCol(vec3(0.28,0.17,0.24),vec3(0.09,0.38,0.60),vec3(0.24,0.13,0.06),vec3(0.04,0.06,0.16),vec3(0.07,0.10,0.14));
  vec3 fogCol =sCol(vec3(0.80,0.50,0.30),vec3(0.58,0.72,0.90),vec3(0.70,0.28,0.05),vec3(0.02,0.03,0.08),vec3(0.12,0.14,0.18));

  float sunAngle=clamp(s/0.58,0.0,1.0)*PI;
  vec3 sunDir=normalize(vec3(cos(sunAngle)*-0.75,sin(sunAngle)*0.38-0.08,-1.0));
  vec3 moonDir=normalize(vec3(-0.14,0.42,-1.0));
  float waveAmp=sF(0.082,0.070,0.100,0.054,0.30)+storm*0.020;
  float fogDen=sF(0.020,0.010,0.022,0.034,0.046);
  float moonAmt=sF(0.0,0.0,0.05,0.92,0.06);
  float sunAbove=step(0.0,sunDir.y),sunGlow=smoothstep(-0.10,0.06,sunDir.y);

  vec3 col;
  if(rd.y<0.0){
    float tFlat=ro.y/(-rd.y),stepSz=tFlat/float(MARCH_STEPS),t=stepSz;
    for(int i=0;i<MARCH_STEPS;i++){if(ro.y+rd.y*t<waveH(ro.xz+rd.xz*t,uT,waveAmp,storm))break;t+=stepSz;}
    float ta=t-stepSz,tb=t;
    for(int i=0;i<REFINE_STEPS;i++){float tm=(ta+tb)*0.5;if(ro.y+rd.y*tm<waveH(ro.xz+rd.xz*tm,uT,waveAmp,storm))tb=tm;else ta=tm;}
    t=(ta+tb)*0.5;
    vec2 wp=ro.xz+rd.xz*t;
    vec3 n=waveNorm(wp,uT,waveAmp,storm),vDir=-rd;
    float fres=pow(1.0-clamp(dot(n,vDir),0.0,1.0),4.0);
    vec3 refl=reflect(rd,n);
    float rh=clamp(refl.y,0.0,1.0);
    vec3 reflSky=mix(mix(skyHori,skyTop,pow(rh,0.42)),skyHori,0.12);
    float rSun=max(dot(refl,sunDir),0.0);
    reflSky+=sunCol*pow(rSun,120.0)*2.0*sunGlow+sunCol*pow(rSun,18.0)*0.07*sunGlow;
    if(moonAmt>0.04)reflSky+=vec3(0.72,0.80,0.95)*pow(max(dot(refl,moonDir),0.0),120.0)*0.78*moonAmt;
    float depth=exp(-t*0.40);
    vec3 waterC=mix(seaDeep,seaShlo,depth*0.5)*mix(vec3(1.0),vec3(0.85,0.92,1.0),clamp(t*0.25,0.0,1.0));
    col=mix(waterC,reflSky,0.15+fres*0.34);
    col+=sunCol*(pow(max(dot(reflect(-sunDir,n),vDir),0.0),200.0)*1.10*sunAbove
                +pow(max(dot(reflect(-sunDir,n),vDir),0.0),32.0)*0.12*sunGlow
                +pow(max(dot(reflect(rd,n),sunDir),0.0),8.0)*0.48*smoothstep(0.0,0.35,-rd.y)*sunGlow
                +smoothstep(0.94,1.0,noise(wp*18.0+vec2(uT*0.55,uT*0.22)))*0.08*sunGlow*sunAbove);
    if(moonAmt>0.04)col+=vec3(0.72,0.80,0.95)*pow(max(dot(reflect(-moonDir,n),vDir),0.0),520.0)*0.09*moonAmt;
    float hC=waveH(wp,uT,waveAmp,storm);
    float curv=waveH(wp+vec2(0.025,0),uT,waveAmp,storm)+waveH(wp-vec2(0.025,0),uT,waveAmp,storm)
              +waveH(wp+vec2(0,0.025),uT,waveAmp,storm)+waveH(wp-vec2(0,0.025),uT,waveAmp,storm)-4.0*hC;
    col+=clamp(curv*(24.0+storm*10.0),0.0,1.0)*vec3(1.0)*(0.03+storm*0.10);
    col=mix(col,fogCol,1.0-exp(-t*fogDen*1.65));
  } else {
    col=mix(skyHori,skyTop,pow(clamp(rd.y,0.0,1.0),0.38));
  }

  vec3 skyCol;
  {
    skyCol=mix(skyHori,skyTop,pow(clamp(rd.y,0.0,1.0),0.38));
    float cb=noise(rd.x*5.5+vec2(rd.y*3.0,uT*0.015)),cb2=noise(rd.x*8.0-vec2(rd.y*4.0,uT*0.010));
    float clouds=smoothstep(0.62,0.86,cb*0.65+cb2*0.35)*smoothstep(-0.02,0.24,rd.y)*(0.08+storm*0.18);
    skyCol=mix(skyCol,mix(skyCol*0.97,mix(vec3(1.0,0.82,0.65),vec3(0.42,0.48,0.56),storm),0.35),clouds);
    float sd=max(dot(rd,sunDir),0.0);
    skyCol+=sunCol*(pow(sd,380.0)*6.8*sunGlow+pow(sd,22.0)*0.20*sunGlow+pow(sd,5.0)*0.09*sunGlow
                   +smoothstep(0.99925,0.99995,dot(rd,sunDir))*2.6*sunGlow
                   +exp(-abs(rd.y)*24.0)*0.11*sunGlow+pow(sd,3.0)*0.035*sunGlow);
    if(moonAmt>0.04){float md=max(dot(rd,moonDir),0.0);
      skyCol+=vec3(0.88,0.92,1.0)*(pow(md,820.0)*7.4*moonAmt+pow(md,6.0)*0.045*moonAmt);}
    if(night>0.02){
      vec2 suv=rd.xy/max(0.12,rd.z+1.6)*140.0;
      float stars=(starField(suv)+starField(suv*0.55+11.7)*0.65)*smoothstep(0.02,0.26,rd.y)*(1.0-storm*0.85);
      skyCol+=vec3(0.80,0.88,1.0)*stars*night*0.82;
    }
    skyCol+=fogCol*exp(-abs(rd.y)*mix(38.0,22.0,storm))*(0.09+storm*0.10);
    skyCol=mix(skyCol,skyCol*vec3(0.91,0.94,0.98),storm*0.22);
  }
  col=mix(col,skyCol,smoothstep(-0.008,0.008,rd.y));
  col=mix(fogCol,col,smoothstep(-0.008,0.018,rd.y)*0.25+0.75);
  col+=( hash(gl_FragCoord.xy*0.5+floor(uT*12.0))-0.5)*0.006;
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}
`;

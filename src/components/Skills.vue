<template>
  <section id="skills" ref="sectionEl" style="border-top:1px solid rgba(255,255,255,0.06)">
    <svg class="absolute h-0 w-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter id="duotone-skills">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" values="0.039 0" />
            <feFuncG type="table" values="0.18 0.706" />
            <feFuncB type="table" values="0.212 0.847" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>

    <div class="px-10 pt-14 pb-0 overflow-hidden">
      <div class="overflow-hidden">
        <h2 ref="hdrEl" class="font-display tracking-[-0.03em] text-white"
            style="font-size:clamp(28px,3.6vw,48px);font-weight:600;transform:translateY(110%)">
          <span class="font-serif italic text-white/65" style="font-weight:400">What</span> I Build
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2"
         style="border-top:1px solid rgba(255,255,255,0.06);margin-top:14px">

      <!-- LEFT: sticky panel -->
      <div
        class="skills-sticky flex flex-col justify-end pb-14 px-10 overflow-hidden lg:sticky lg:top-0"
        style="height:100dvh;border-right:1px solid rgba(255,255,255,0.06)"
      >
        <div class="absolute right-2 bottom-0 font-mono pointer-events-none select-none leading-none"
             style="font-size:20vw;color:rgba(255,255,255,0.02);transform:translateX(6%);font-weight:600">{{ active+1 }}</div>

        <div class="relative z-10">
          <transition name="sl" mode="out-in">
            <div :key="active">
              <p class="font-mono text-white/10 leading-none mb-2"
                 style="font-size:clamp(64px,10vw,140px);letter-spacing:-.04em;font-weight:600">
                {{ String(active+1).padStart(2,'0') }}
              </p>
              <h3 class="font-display tracking-[-0.02em] text-white leading-tight mb-3"
                  style="font-size:clamp(22px,2.4vw,34px);font-weight:600">{{ panels[active].title }}</h3>
              <div class="w-8 h-[2px] mb-4 rounded-full" style="background:rgba(var(--accent-rgb),0.5)"/>
              <p class="font-body text-white/50 leading-relaxed max-w-xs"
                 style="font-size:clamp(12px,1vw,14px);font-weight:400">{{ panels[active].desc }}</p>
              <div class="flex flex-wrap gap-1.5 mt-6">
                <span v-for="t in panels[active].tags" :key="t"
                      class="font-mono text-[9px] tracking-[.22em] uppercase px-3 py-1.5
                             text-white/55 transition-all duration-300 hover:text-white/90 hover:border-white/20"
                      style="border:1px solid rgba(255,255,255,0.10);border-radius:8px;font-weight:500">{{ t }}</span>
              </div>
            </div>
          </transition>
        </div>

        <div class="absolute bottom-7 left-10 flex gap-2 items-center">
          <div v-for="(_,i) in panels" :key="i" class="transition-all duration-500 rounded-full"
               :style="i===active?'width:2rem;height:2px;background:var(--accent)':'width:5px;height:2px;background:rgba(255,255,255,0.15)'"/>
          <span class="font-mono text-white/30 ml-2"
                style="font-size:9px;letter-spacing:.3em;font-weight:500">
            {{ String(active+1).padStart(2,'0') }}/{{ String(panels.length).padStart(2,'0') }}
          </span>
        </div>
      </div>

      <!-- RIGHT: panels -->
      <div>
        <div v-for="(p,i) in panels" :key="i" :ref="el=>pRefs[i]=el"
             class="relative flex flex-col justify-center px-10 py-16 min-h-screen"
             style="border-bottom:1px solid rgba(255,255,255,0.04)">
          <span class="absolute right-4 top-1/2 -translate-y-1/2 font-mono
                       pointer-events-none select-none"
                style="font-size:clamp(44px,8vw,110px);color:rgba(255,255,255,0.02);line-height:1;font-weight:600">
            {{ String(i+1).padStart(2,'0') }}
          </span>
          <div class="relative z-10">
            <div class="overflow-hidden mb-5">
              <h3 :ref="el=>tRefs[i]=el" data-velocity-skew class="font-display tracking-[-0.03em] text-white leading-[0.95]"
                  style="font-size:clamp(30px,4.5vw,62px);font-weight:600;transform:translateY(110%)">{{ p.title }}</h3>
            </div>
            <div class="overflow-hidden mb-7">
              <p :ref="el=>dRefs[i]=el" class="font-body text-white/50 leading-relaxed max-w-md"
                 style="font-size:clamp(13px,1.1vw,15px);font-weight:400;transform:translateY(110%)">{{ p.body }}</p>
            </div>
            <div :ref="el=>imgWrapRefs[i]=el"
                 class="overflow-hidden h-48 relative rounded-xl glass"
                 style="border-radius:14px;clip-path:inset(0 100% 0 0)">
              <img :src="p.img" :alt="p.title"
                   class="duotone-img w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                   style="filter:url(#duotone-skills) brightness(0.55);opacity:0.7"/>
              <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(6,6,10,.8) 0%,transparent 55%)"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const sectionEl=ref(null),hdrEl=ref(null),pRefs=ref([]),tRefs=ref([]),dRefs=ref([]),imgWrapRefs=ref([]),active=ref(0)

const panels=[
  {title:'iOS App Development',desc:'Swift 原生开发，AI 辅助架构，WidgetKit & ActivityKit 完整集成。',
   body:'SwiftUI 构建像素级界面，Dynamic Island 与 Live Activity 深度集成。',
   tags:['Swift','SwiftUI','Xcode','WidgetKit'],
   img:'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=80&fit=crop&fm=webp'},
  {title:'Frontend & Web',desc:'精通 Vue 3 + Vite，GSAP 动画，输出高还原度、高交互性前端页面。',
   body:'Composition API，前后端分离，Lenis 平滑滚动，完整动效系统。',
   tags:['Vue 3','Vite','GSAP','Tailwind'],
   img:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80&fit=crop&fm=webp'},
  {title:'AI-Driven Dev',desc:'深度运用 Cursor、Claude Code，精通 Prompt Engineering。',
   body:'利用 AI 快速搭建骨架，编写复杂组件，显著压缩开发周期。',
   tags:['Cursor','Claude Code','Gemini','Prompt Eng'],
   img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=80&fit=crop&fm=webp'},
  {title:'UI/UX & Visual Design',desc:'Figma 全流程，Adobe Animate 帧动画，Pixel Art 视觉创作。',
   body:'低保真到高保真全链路，原型快速迭代，兼具工程思维与美学判断力。',
   tags:['Figma','Photoshop','Adobe Animate','达芬奇'],
   img:'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=700&q=80&fit=crop&fm=webp'},
]

let ctx
onMounted(()=>{
  ctx=gsap.context(()=>{
    gsap.to(hdrEl.value,{y:'0%',duration:1,ease:'expo.out',
      scrollTrigger:{
        trigger:sectionEl.value, start:'top 80%', end:'top 40%',
        toggleActions:'play reverse play reverse'
      }})

    pRefs.value.forEach((p,i)=>{
      ScrollTrigger.create({
        trigger:p, start:'top 70%', end:'top 30%',
        toggleActions:'play reverse play reverse',
        onEnter(){
          gsap.to(tRefs.value[i],{y:'0%',duration:1,ease:'expo.out'})
          gsap.to(dRefs.value[i],{y:'0%',duration:.9,ease:'power3.out',delay:.12})
          if (imgWrapRefs.value[i]) {
            gsap.to(imgWrapRefs.value[i], {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.2, ease: 'expo.inOut', delay: 0.2
            })
          }
        },
        onLeaveBack(){
          gsap.to(tRefs.value[i],{y:'110%',duration:.6,ease:'power3.in'})
          gsap.to(dRefs.value[i],{y:'110%',duration:.5,ease:'power3.in'})
          if (imgWrapRefs.value[i]) {
            gsap.to(imgWrapRefs.value[i], { clipPath: 'inset(0 100% 0 0)', duration: 0.6, ease: 'expo.inOut' })
          }
        }
      })

      ScrollTrigger.create({trigger:p,start:'top center',end:'bottom center',
        onEnter:()=>{active.value=i},onEnterBack:()=>{active.value=i}})

      gsap.to(tRefs.value[i], {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top top', end: 'bottom top', scrub: 1.5 }
      })
    })
  },sectionEl.value)
})
onUnmounted(()=>ctx?.revert())
</script>

<style scoped>
.sl-enter-active,.sl-leave-active{transition:opacity .35s ease,transform .35s ease}
.sl-enter-from{opacity:0;transform:translateY(18px) scale(0.97)}
.sl-leave-to{opacity:0;transform:translateY(-14px) scale(0.97)}

.duotone-img {
  transition: transform 700ms ease-out, filter 700ms ease-out, opacity 700ms ease-out;
}

.duotone-img:hover {
  filter: brightness(0.65) saturate(0.85) !important;
}

@supports not (height: 100dvh) {
  .skills-sticky { height: 100vh; }
}
</style>
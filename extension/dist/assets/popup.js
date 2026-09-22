(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function c(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(t){if(t.ep)return;t.ep=!0;const r=c(t);fetch(t.href,r)}})();const u="http://localhost:3001";let a=null;const m=document.getElementById("current-topic"),w=document.getElementById("create-topic-btn"),d=document.getElementById("capture-btn"),s=document.getElementById("add-btn"),f=document.getElementById("comment"),h=document.getElementById("preview-container"),y=document.getElementById("preview"),v=document.getElementById("status");function o(e){v.textContent=e}async function g(){const e=await fetch(`${u}/topics/current`);if(!e.ok)throw new Error("Unable to load current topic");return e.json()}function p(e){if(!e){m.innerHTML=`
      <div class="topic-name">
        No active topic
      </div>

      <div class="topic-count">
        Create a topic to start documenting.
      </div>
    `,d.disabled=!0;return}m.innerHTML=`
    <div class="topic-name">
      ${b(e.name)}
    </div>

    <div class="topic-count">
      ${e.screenshotCount}
      screenshot(s)
    </div>
  `,d.disabled=!1}function b(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}async function E(){try{const e=await g();p(e)}catch{o("Backend is not running."),d.disabled=!0}}w.addEventListener("click",async()=>{const e=window.prompt("Enter topic name:");if(e?.trim())try{o("Creating topic...");const n=await fetch(`${u}/topics`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e.trim()})});if(!n.ok)throw new Error("Failed to create topic");const c=await n.json();p(c),o("Topic created.")}catch{o("Unable to create topic.")}});d.addEventListener("click",async()=>{try{o("Capturing screenshot...");const e=await chrome.tabs.query({active:!0,currentWindow:!0});if(!e.length)throw new Error("No active tab.");const n=await chrome.tabs.captureVisibleTab(e[0].windowId,{format:"png"});a=n,y.src=n,h.classList.remove("hidden"),s.classList.remove("hidden"),o("Screenshot captured.")}catch(e){console.error(e),o("Unable to capture screenshot.")}});s.addEventListener("click",async()=>{if(!a){o("Capture a screenshot first.");return}try{s.disabled=!0,o("Adding screenshot...");const e=await fetch(`${u}/topics/current/screenshots`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:a,comment:f.value.trim()})});if(!e.ok){const i=await e.text();throw new Error(i)}const n=await e.json();a=null,y.src="",h.classList.add("hidden"),s.classList.add("hidden"),f.value="";const c=await g();p(c),o(`Screenshot added. Total: ${n.screenshotCount}`)}catch(e){console.error(e),o("Unable to add screenshot.")}finally{s.disabled=!1}});E();

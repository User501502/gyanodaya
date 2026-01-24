fetch("/api/settings")
.then(r=>r.json())
.then(s=>{
  document.getElementById("schoolName").innerText=s.schoolName;
  document.getElementById("footer").innerHTML=s.address;
});

fetch("/api/sections")
.then(r=>r.json())
.then(sections=>{
  const box=document.getElementById("dynamicSections");
  sections.forEach(s=>{
    let html=`<section><h2>${s.title}</h2>`;
    if(s.type==="list"){
      html+="<ul>";
      s.content.forEach(i=>html+=`<li>${i}</li>`);
      html+="</ul>";
    } else {
      html+=`<p>${s.content.join(" ")}</p>`;
    }
    html+="</section>";
    box.innerHTML+=html;
  });
});

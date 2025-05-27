document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav ul.nav-links li a");
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const body = document.body;

  // Smooth scroll for nav links
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 70, // Adjust for fixed header height
          behavior: "smooth",
        });
      }
      // Close mobile menu after clicking
      if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
        navToggle.classList.remove("active");
        body.classList.remove("menu-active-bg");
      }
    });
  });

  // Toggle mobile menu
  navToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    navToggle.classList.toggle("active");
    body.classList.toggle("menu-active-bg");
  });
});

const username = "ziaadwael";
const container = document.getElementById("projects-container");

async function getReadmeImage(repoName) {
  try {
    // نجيب ملف README.md بصيغة Base64
    const readmeRes = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/readme`
    );
    if (!readmeRes.ok) return null;

    const readmeData = await readmeRes.json();
    const content = atob(readmeData.content);

    // نبحث عن أول رابط صورة في README
    const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1];
      // لو الرابط نسبي (داخل الريبو) نعمله رابط كامل
      if (!imgUrl.startsWith("http")) {
        imgUrl = `https://raw.githubusercontent.com/${username}/${repoName}/master/${imgUrl}`;
      }
      return imgUrl;
    }
    return null;
  } catch {
    return null;
  }
}

async function loadProjects() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=created&direction=desc`
    );
    const repos = await response.json();

    const recentProjects = repos
      .filter((repo) => !repo.fork && repo.description)
      .slice(0, 6);

    for (const repo of recentProjects) {
      const projectCard = document.createElement("article");
      projectCard.className =
        "bg-bgDark rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 flex flex-col";

      // نجيب صورة من README.md لو موجودة
      let imageUrl = await getReadmeImage(repo.name);
      if (!imageUrl) {
        imageUrl = "https://via.placeholder.com/600x300?text=Project+Image";
      }

      // استخراج رابط الديمو من الوصف
      const demoMatch = repo.description.match(/https?:\/\/[^\s]+/g);
      let demoUrl = repo.html_url;
      if (demoMatch) {
        demoMatch.forEach((link) => {
          if (
            link.includes("netlify") ||
            link.includes("vercel") ||
            link.includes("render") ||
            link.includes("github.io")
          ) {
            demoUrl = link;
          }
        });
      }

      // تنظيف الوصف من الروابط
      let cleanDescription = repo.description;
      if (demoMatch) {
        demoMatch.forEach((link) => {
          cleanDescription = cleanDescription.replace(link, "");
        });
      }
      cleanDescription = cleanDescription.trim();

      projectCard.innerHTML = `
        <img src="${imageUrl}" alt="${repo.name}" class="rounded-md mb-4 w-full h-[180px] object-cover" loading="lazy">
        <h3 class="text-xl font-semibold text-primary mb-3">${repo.name}</h3>
        <p class="text-textLight mb-4">${cleanDescription}</p>
        <a
          href="${demoUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block text-accent font-semibold hover:underline mt-auto"
        >
          View Project
        </a>
      `;

      container.appendChild(projectCard);
    }
  } catch (error) {
    console.error("Error fetching repos:", error);
    container.innerHTML = `<p class="text-red-500">حدث خطأ أثناء تحميل المشاريع.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProjects);

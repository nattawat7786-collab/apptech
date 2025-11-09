const companyList = document.getElementById("companyList");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("closeBtn");
const overlayLogo = document.getElementById("overlayLogo");
const overlayTitle = document.getElementById("overlayTitle");
const overlayDesc = document.getElementById("overlayDesc");
const overlayLink = document.getElementById("overlayLink");

function openOverlay() {
  overlay.style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeOverlay() {
  overlay.style.display = "none";
  document.body.classList.remove("modal-open");
}

function handleOverlayClick(event) {
  const clickedElement = event.target;
  const isInsideBox = clickedElement.closest(".overlay-box");
  if (isInsideBox === null) {
    closeOverlay();
  }
}

function createCompanyCard(company) {
  const article = document.createElement("article");
  article.setAttribute("data-name", company.name);
  article.setAttribute("data-desc", company.desc);
  article.setAttribute("data-img", company.img);
  article.setAttribute("data-url", company.url);

  const logo = document.createElement("img");
  logo.src = company.img;
  logo.alt = company.name;
  logo.width = 120;
  logo.height = 120;

  const title = document.createElement("h2");
  title.textContent = company.name;

  const desc = document.createElement("p");
  desc.textContent = company.desc;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "open-btn";
  button.textContent = "รายละเอียด";

  button.addEventListener("click", function () {
    overlayTitle.textContent = company.name;
    overlayDesc.textContent = company.desc;
    overlayLogo.src = company.img;
    overlayLogo.alt = company.name;
    overlayLink.href = company.url;
    openOverlay();
  });

  article.appendChild(logo);
  article.appendChild(title);
  article.appendChild(desc);
  article.appendChild(button);

  return article;
}

function loadCompanies() {
  fetch("companies.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((company) => {
        const card = createCompanyCard(company);
        companyList.appendChild(card);
      });
    })
    .catch((error) => console.error("Error loading companies:", error));
}

closeButton.addEventListener("click", closeOverlay);
overlay.addEventListener("click", handleOverlayClick);

loadCompanies();
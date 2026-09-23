import { Topic } from "./types";

const API_URL = "http://localhost:3001";

let capturedImage: string | null = null;

const currentTopicElement = document.getElementById(
  "current-topic",
) as HTMLDivElement;

const createTopicButton = document.getElementById(
  "create-topic-btn",
) as HTMLButtonElement;

const captureButton = document.getElementById(
  "capture-btn",
) as HTMLButtonElement;

const addButton = document.getElementById("add-btn") as HTMLButtonElement;

const commentInput = document.getElementById("comment") as HTMLTextAreaElement;

const previewContainer = document.getElementById(
  "preview-container",
) as HTMLDivElement;

const preview = document.getElementById("preview") as HTMLImageElement;

const statusElement = document.getElementById("status") as HTMLDivElement;

const existingTopicsDropdown = document.getElementById(
  "existingTopicsDropdown",
) as HTMLSelectElement;

function setStatus(message: string) {
  statusElement.textContent = message;
}

async function getCurrentTopic(): Promise<Topic | null> {
  const response = await fetch(`${API_URL}/topics/current`);

  if (!response.ok) {
    throw new Error("Unable to load current topic");
  }

  return response.json();
}

async function setCurrentTopic(topicId: string): Promise<Topic | null> {
  const response = await fetch(`${API_URL}/topics/current`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      id: topicId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to set current topic");
  }

  return await response.json();
}

function displayTopic(topic: Topic | null) {
  if (!topic) {
    currentTopicElement.innerHTML = `
      <div class="topic-name">
        No active topic
      </div>

      <div class="topic-count">
        Create a topic to start documenting.
      </div>
    `;

    captureButton.disabled = true;

    return;
  }

  currentTopicElement.innerHTML = `
    <div class="topic-name">
      ${escapeHtml(topic.name)}
    </div>

    <div class="topic-count">
      ${topic.screenshotCount}
      screenshot(s)
    </div>
  `;

  captureButton.disabled = false;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadCurrentTopic() {
  try {
    const topic = await getCurrentTopic();

    displayTopic(topic);
  } catch (error) {
    setStatus("Backend is not running.");

    captureButton.disabled = true;
  }
}
async function loadTopicList() {
  try {
    setStatus("Loading topics...");
    const response = await fetch(`${API_URL}/topics`);
    if (!response.ok) {
      throw new Error("Unable to load list of topics");
    }
    const topics: Topic[] = await response.json();
    topics.forEach((item) => {
      const option = document.createElement("option") as HTMLOptionElement;
      option.value = item.id;
      option.textContent = item.name;
      existingTopicsDropdown.appendChild(option);
    });
    setStatus("Topics loaded.");
  } catch (error) {
    setStatus("Unable to load Topics.");
  }
}

existingTopicsDropdown.addEventListener("change", async (event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value;
  if (selectedValue === "") return;
  try {
    const topic = await setCurrentTopic(selectedValue);
    displayTopic(topic);
    setStatus("Topic switched");
  } catch (error) {
    setStatus("Failed to switch topic");
  }
});

createTopicButton.addEventListener("click", async () => {
  const name = window.prompt("Enter topic name:");

  if (!name?.trim()) {
    return;
  }

  try {
    setStatus("Creating topic...");

    const response = await fetch(`${API_URL}/topics`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create topic");
    }

    const topic: Topic = await response.json();

    displayTopic(topic);

    setStatus("Topic created.");
  } catch (error) {
    setStatus("Unable to create topic.");
  }
});

captureButton.addEventListener("click", async () => {
  try {
    setStatus("Capturing screenshot...");

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tabs.length) {
      throw new Error("No active tab.");
    }

    const screenshot = await chrome.tabs.captureVisibleTab(tabs[0].windowId, {
      format: "png",
    });

    capturedImage = screenshot;

    preview.src = screenshot;

    previewContainer.classList.remove("hidden");

    addButton.classList.remove("hidden");

    setStatus("Screenshot captured.");
  } catch (error) {
    console.error(error);

    setStatus("Unable to capture screenshot.");
  }
});

addButton.addEventListener("click", async () => {
  if (!capturedImage) {
    setStatus("Capture a screenshot first.");

    return;
  }

  try {
    addButton.disabled = true;

    setStatus("Adding screenshot...");

    const response = await fetch(`${API_URL}/topics/current/screenshots`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        image: capturedImage,

        comment: commentInput.value.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(error);
    }

    const result = await response.json();

    capturedImage = null;

    preview.src = "";

    previewContainer.classList.add("hidden");

    addButton.classList.add("hidden");

    commentInput.value = "";

    const topic = await getCurrentTopic();

    displayTopic(topic);

    setStatus(`Screenshot added. Total: ${result.screenshotCount}`);
  } catch (error) {
    console.error(error);

    setStatus("Unable to add screenshot.");
  } finally {
    addButton.disabled = false;
  }
});

loadCurrentTopic();
loadTopicList();

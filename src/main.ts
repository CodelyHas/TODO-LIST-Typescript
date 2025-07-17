import { v4 as uuidV4 } from "uuid"
type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
}
const list = document.querySelector<HTMLUListElement>("#todo-list")
const formBlock = document.querySelector<HTMLDivElement>("#form-filling-block")
const form = document.getElementById("new-task-form") as HTMLFormElement | null
const titleInput = document.querySelector<HTMLInputElement>("#new-task-title")
const descriptionInput = document.querySelector<HTMLInputElement>("#new-task-description")
const closeButton = document.querySelector<HTMLButtonElement>(".close-button")
const addButton = document.querySelector<HTMLButtonElement>(".add-button")
const modalOverlay = document.querySelector<HTMLDivElement>("#modal-overlay")
const toastContainer = document.querySelector<HTMLDivElement>("#toast-container")

const tasks: Task[] = loadTasks()

tasks.forEach(addListItem)

//showing the form block
addButton?.addEventListener("click", () => {
  showFormBlock()
});

closeButton?.addEventListener("click", () => {
  hideFormBlock()
})



form?.addEventListener("submit", e => {
  e.preventDefault()
  if (!titleInput || !descriptionInput) return

  const defaultTitleValue = titleInput.value.trim() === "" ? "Task" : titleInput.value.trim()
  const descValue = descriptionInput.value.trim()

  const descError = document.getElementById("description-error") as HTMLDivElement
  if (!descError) return

  descriptionInput.addEventListener("input", () => {
    if (descriptionInput.value.trim() !== "") {
      descriptionInput.classList.remove("input-error")
      descError.textContent = ""
      descError.style.display = "none"
    }
  })

  if (descriptionInput.value.trim() === "") {
    descriptionInput.classList.add("input-error")
    descError.textContent = "Please enter a description!"
    descError.style.display = "block"
    descriptionInput.focus()
    return
  }


  const newTask: Task = {
    id: uuidV4(),
    title: defaultTitleValue,
    description: descValue,
    completed: false,
    createdAt: new Date()
  }

  tasks.push(newTask)
  saveTasks()
  addListItem(newTask)
  titleInput.value = ""
  descriptionInput.value = ""
  hideFormBlock()
})

function addListItem(task: Task) {
  const item = document.createElement("li")
  const titleLabel = document.createElement("label")
  const descLabel = document.createElement("label")
  const checkbox = document.createElement("input")
  const timeLabel = document.createElement("div")
  const deleteButton = document.createElement("button")
  const trashIcon = document.createElement("i")

  titleLabel.textContent = task.title
  descLabel.textContent = task.description

  const createdDate = new Date(task.createdAt)
  const formattedTime = createdDate.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric"
  })

  timeLabel.textContent = `Created: ${formattedTime}`
  timeLabel.classList.add("created-time")

  trashIcon.className = "fa-solid fa-trash"
  deleteButton.className = "delete-button"
  deleteButton.appendChild(trashIcon)

  checkbox.type = "checkbox"
  checkbox.checked = task.completed

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked
    item.classList.toggle("completed", task.completed)
    saveTasks()
  })

  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation()
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      const deletedTask = tasks.splice(index, 1)[0];
      saveTasks();
      item.remove();
      showToast(deletedTask);
    }
  })

  item.addEventListener("click", (event) => {
    let targetElement = (event.target as HTMLElement).tagName
    if (targetElement !== "INPUT" && targetElement !== "BUTTON" && targetElement !== "I") {
      checkbox.checked = !checkbox.checked
      task.completed = checkbox.checked
      item.classList.toggle("completed", task.completed)
      saveTasks()
    }
  })

  item.append( checkbox, titleLabel, descLabel, timeLabel, deleteButton)
  list?.append(item)
}

function saveTasks() {
  localStorage.setItem("TASKS", JSON.stringify(tasks))
  console.log(localStorage.getItem("Task"))
}

function loadTasks(): Task[] {
  const taskJson = localStorage.getItem("TASKS")
  let checkedTaskJson = (taskJson == null) ? [] : JSON.parse(taskJson)
  return checkedTaskJson
}

function showToast(task: Task) {
  if (!toastContainer) return

  const toast = document.createElement("div")
  toast.className = "delToast"

  const message = document.createElement("span")
  message.textContent = "Task has been deleted!"

  const undoButton = document.createElement("button")
  undoButton.className = "undo-button"
  undoButton.textContent = "Undo"

  undoButton.addEventListener("click", () => {
    tasks.push(task)
    saveTasks()
    addListItem(task)
    toast.remove()
  })

  toast.appendChild(message)
  toast.appendChild(undoButton)
  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 5000)
}

function showFormBlock() {
  formBlock?.style.setProperty("display", "block")
  modalOverlay?.style.setProperty("display", "block")
  document.body.style.overflow = "hidden"
}

function hideFormBlock() {
  formBlock?.style.setProperty("display", "none")
  modalOverlay?.style.setProperty("display", "none")
  document.body.style.overflow = "visible"
}
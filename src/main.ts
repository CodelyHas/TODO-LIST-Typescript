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
const clearButton = document.querySelector<HTMLButtonElement>("#clear-button")
const form = document.getElementById("new-task-form") as HTMLFormElement | null
const titleInput = document.querySelector<HTMLInputElement>("#new-task-title")
const descriptionInput = document.querySelector<HTMLInputElement>("#new-task-description")
const descError = document.getElementById("description-error") as HTMLDivElement
const closeButton = document.querySelector<HTMLButtonElement>(".close-button")
const addButton = document.querySelector<HTMLButtonElement>(".add-button")
const modalOverlay = document.querySelector<HTMLDivElement>("#modal-overlay")
const toastContainer = document.querySelector<HTMLDivElement>("#toast-container")

const tasks: Task[] = loadTasks()

tasks.forEach(addListItem)

clearButton?.addEventListener("click", (e) => {
  e.stopPropagation()
  const confirmationBlock = document.createElement("div")
  confirmationBlock.id = "confirmation-block"

  const confirmationTxt = document.createElement("span")
  confirmationTxt.textContent = "Are you sure you want to clear all tasks?"
  confirmationTxt.classList.add("confirmation-text")

  const confirmButton = document.createElement("button")
  confirmButton.textContent = "Confirm"
  confirmButton.classList.add("confirmation-buttons", "confirm")

  const cancelButton = document.createElement("button")
  cancelButton.textContent = "Cancel"
  cancelButton.classList.add("confirmation-buttons", "cancel")

  confirmButton.addEventListener("click", () => {
    localStorage.clear()
    tasks.length = 0
    while (list?.firstChild) {
     list.removeChild(list.firstChild);
    }
    saveTasks()
    hideShownBlock(confirmationBlock)
  })

  cancelButton.addEventListener("click", () => {
    hideShownBlock(confirmationBlock)
  })
  
  confirmationBlock.append(confirmationTxt, cancelButton, confirmButton)
  document.body.appendChild(confirmationBlock)
  showHiddenBlock(confirmationBlock)
})

addButton?.addEventListener("click", () => {
  showHiddenBlock(formBlock as HTMLElement)
  titleInput?.focus()
})


closeButton?.addEventListener("click", () => {
  resetForm()
})

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const isFormVisible = formBlock?.style.display === "block";
    if (isFormVisible) {
      resetForm();
    }
  }
});

form?.addEventListener("submit", e => {
  e.preventDefault()
  if (!titleInput || !descriptionInput) return

  const defaultTitleValue = titleInput.value.trim() === "" ? "Task" : titleInput.value.trim()
  const descValue = descriptionInput.value.trim()

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
  hideShownBlock(formBlock as HTMLElement)
})

function addListItem(task: Task) {
  const item = document.createElement("li")
  const titleLabel = document.createElement("label")
  const descLabel = document.createElement("label")
  const checkbox = document.createElement("input")
  const timeLabel = document.createElement("div")
  const deleteButton = document.createElement("button")
  const trashIcon = document.createElement("i")
  const editButton = document.createElement("button")
  const editIcon = document.createElement("i")
  const checkButton = document.createElement("button")
  const checkIcon = document.createElement("i")
  const discardButton = document.createElement("button")
  const discardIcon = document.createElement("i")
  const editInput = document.createElement("input")

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

  editInput.className = "description-edit"
  editInput.type = "text"
  editInput.value = task.description

  checkIcon.className = "fa-solid fa-check"
  checkButton.className = "check-button"
  checkButton.appendChild(checkIcon)

  discardIcon.className = "fa-solid fa-xmark"
  discardButton.className = "discard-button"
  discardButton.appendChild(discardIcon)

  editIcon.className = "fa-solid fa-pen"
  editButton.className = "edit-button"
  editButton.appendChild(editIcon)

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


  editButton.addEventListener("click", (e) => {
    e.stopPropagation()

    deleteButton.style.display = "none";
    checkbox.style.display = "none";
    editButton.style.display = "none";

    checkButton.style.display = "block"
    discardButton.style.display = "block"

    descLabel.replaceWith(editInput)
    editInput.focus()

    const confirmEdit = () => {
      const newDesc = editInput.value.trim()
      if(newDesc !== "") {
        task.description = newDesc
        saveTasks()
        descLabel.textContent = newDesc
        editInput.replaceWith(descLabel)
        editInput.classList.remove("input-error")
        resetEditUI()
      }
      else {
       editInput.classList.add("input-error")
      }
    }

    const cancelEdit = () => {
      editInput.value = task.description.trim()
      editInput.replaceWith(descLabel)
      if(editInput.classList.contains("input-error")) {
        editInput.classList.remove("input-error")
      }
      resetEditUI()
      }

    checkButton.onclick = (e) => {
      e?.stopPropagation();
      confirmEdit();
    };

    discardButton.onclick = (e) => {
      e?.stopPropagation();
      cancelEdit();
    };

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmEdit();
      if (e.key === "Escape") cancelEdit();
    });
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

  function resetEditUI() {
    deleteButton.style.display = "block";
    checkbox.style.display = "block";
    editButton.style.display = "block";
    checkButton.style.display = "none";
    discardButton.style.display = "none";
  }

  item.append( checkbox, titleLabel, descLabel, timeLabel, checkButton, discardButton, editButton, deleteButton)
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

function resetForm() {
  descriptionInput?.classList.remove("input-error");
  if (descError) {
    descError.textContent = "";
    descError.style.display = "none";
  }

  titleInput!.value = "";
  descriptionInput!.value = "";

  hideShownBlock(formBlock as HTMLElement);
}

function showHiddenBlock(element: HTMLElement) {
  element?.style.setProperty("display", "block")
  modalOverlay?.style.setProperty("display", "block")
  document.body.style.overflow = "hidden"
}

function hideShownBlock(element: HTMLElement) {
  element?.style.setProperty("display", "none")
  modalOverlay?.style.setProperty("display", "none")
  document.body.style.overflow = "visible"
}
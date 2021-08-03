//remove project
import formatRelative from "date-fns/formatRelative";
import parseISO from "date-fns/parseISO";
import parse from "date-fns/parse";
import format from "date-fns/format";
import toDate from "date-fns/toDate";
import formatISO from "date-fns/formatISO";

const content = document.querySelector("#content");
const makeTodoButton = document.querySelector("#newTodo");
makeTodoButton.onclick = makeTodoForm;
const newProjectButton = document.querySelector("#newProject");
newProjectButton.onclick = createNewProjectForm;
const viewAllButton = document.querySelector("#viewAll");
viewAllButton.onclick = viewAllTasks;
const viewCompletedButton = document.querySelector("#viewCompleted");
viewCompletedButton.onclick = viewCompleted;
const sortByPriorityButton = document.querySelector("#sortByPriority");
sortByPriorityButton.onclick = displayTasksByPriority;
const projectSelector = document.querySelector("#projectSelector");
const projectWrap = document.querySelector("#projectWrap");
const { toDoList, projects, completed } = hasLocalStorage();

//Display all todos on page load
window.onload = function () {
  populate("default");
  projectSelectorDisplay();
};

//*******************************************************************************
//*********************************LOCAL STORAGE*********************************

//Check if localStorage already  exists
function hasLocalStorage() {
  //If it does parse and return them
  if (localStorage.toDoList) {
    const toDoList = JSON.parse(localStorage.getItem("toDoList"));
    const projects = JSON.parse(localStorage.getItem("projects"));
    const completed = JSON.parse(localStorage.getItem("completed"));
    return { toDoList, projects, completed };
    //If no localStorage exists create default project list and empty todo list
  } else {
    const toDoList = [];
    const projects = ["default", "all"];
    const completed = [];
    return { toDoList, projects, completed };
  }
}

//save to localStorage
function saveToLocal(toDoList, projects, completed) {
  localStorage.setItem("toDoList", JSON.stringify(toDoList));
  localStorage.setItem("projects", JSON.stringify(projects));
  localStorage.setItem("completed", JSON.stringify(completed));
}

//*******************************************************************************
//***********************************TODO CRUD***********************************

//random id generator
function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

//create todo item,
function makeTodo(title, description, dueDate, priority, project) {
  const toDo = {
    id: generateId(),
    title,
    description,
    dueDate,
    priority,
    project: project || "default",
  };
  //push item into toDoList array
  toDoList.push(toDo);
  //display todo on DOM **TODO: if viewing current project**
  populate(toDo.project);
  //save toDoList to local storage
  saveToLocal(toDoList, projects, completed);
}

//find particular task by id
function findTodo(id) {
  return toDoList.find((el) => el.id === id);
}
//find particular tasks index in the toDoList array
function findTodoIndex(id) {
  return toDoList.findIndex((el) => el.id === id);
}

function findCompletedTask(id) {
  return completed.findIndex((el) => el.id === id);
}

//remove task from toDoList array
function deleteTodo(id) {
  const index = findTodoIndex(id);
  toDoList.splice(index, 1);
  saveToLocal(toDoList, projects, completed);
}

function sortTasksByPriority() {
  return toDoList.sort((a, b) => a.priority - b.priority);
}

//Gather form data from dom and return it as object
function getFormData() {
  event.preventDefault();
  const title = document.querySelector("#title").value;
  const description = document.querySelector("#description").value;
  const dueDate = document.querySelector("#dueDate").value;
  const priority = document.querySelector("#priority").value;
  const project = document.querySelector("#project").value;
  return { title, description, dueDate, priority, project };
}

//Take form data object and create a new task and add it to toDoList array
function getFormDataAndCreate() {
  const data = getFormData();
  makeTodo(
    data.title,
    data.description,
    data.dueDate,
    data.priority,
    data.project
  );
  event.target.parentElement.remove();
}

//Take form data object and update task with new information
function getFormDataAndUpdate() {
  const data = getFormData();
  console.dir(this);
  this.title = data.title;
  this.description = data.description;
  this.dueDate = data.dueDate;
  this.priority = data.priority;
  updateTodoDisplay(this);
  event.target.parentElement.remove();
  saveToLocal(toDoList, projects, completed);
}

//*******************************************************************************
//***********************************PROJECTS************************************

function createNewProject(project) {
  projects.push(project);
  saveToLocal(toDoList, projects, completed);
}

function getProjectFormData() {
  event.preventDefault();
  const project = document.querySelector("#projectTitle").value;
  createNewProject(project);
  projectSelectorDisplay();
  event.target.parentElement.remove();
}

//*******************************************************************************
//***********************************DOM STUFF***********************************
//make task form
function makeTodoForm(condition, element) {
  if (document.querySelector("#newTaskForm"))
    document.querySelector("#newTaskForm").remove();
  if (document.querySelector("#newProjectForm"))
    document.querySelector("#newProjectForm").remove();

  const form = make("form");
  form.id = "newTaskForm";
  form.classList.add("new-form-animation");

  const titleWrap = make("div");
  titleWrap.classList.add("form-element-wrap");
  const title = make("input");
  const titleLabel = make("label");
  titleLabel.for = "title";
  titleLabel.innerText = "Title";
  titleLabel.classList.add("form-label");
  title.type = "text";
  title.id = "title";
  title.placeholder = "title";
  titleWrap.appendChild(titleLabel);
  titleWrap.appendChild(title);
  form.appendChild(titleWrap);

  const descriptionWrap = make("div");
  descriptionWrap.classList.add("form-element-wrap");
  const descriptionLabel = make("label");
  descriptionLabel.for = "description";
  descriptionLabel.innerText = "Description";
  descriptionLabel.classList.add("form-label");
  const description = make("input");
  description.type = "text";
  description.id = "description";
  description.placeholder = "description";
  descriptionWrap.appendChild(descriptionLabel);
  descriptionWrap.appendChild(description);
  form.appendChild(descriptionWrap);

  const dueDateWrap = make("div");
  dueDateWrap.classList.add("form-element-wrap");
  const dueDateLabel = make("label");
  dueDateLabel.for = "dueDate";
  dueDateLabel.innerText = "Due";
  dueDateLabel.classList.add("form-label");
  const dueDate = make("input");
  dueDate.type = "datetime-local";
  dueDate.id = "dueDate";
  dueDate.value = `${format(new Date(), "yyyy-MM-dd'T'hh:mm", {
    awareOfUnicodeTokens: true,
  })}`;
  dueDateWrap.appendChild(dueDateLabel);
  dueDateWrap.appendChild(dueDate);
  form.appendChild(dueDateWrap);

  const projectSelectWrap = make("div");
  projectSelectWrap.classList.add("form-element-wrap");
  const projectLabel = make("label");
  projectLabel.for = "project";
  projectLabel.innerText = "project";
  projectLabel.classList.add("form-label");
  const projectSelect = make("select");
  projectSelect.id = "project";
  projects.forEach((project) => {
    if (project === "all") return;
    const option = make("option");
    option.value = `${project}`;
    option.innerText = `${project}`;
    projectSelect.appendChild(option);
  });
  projectSelectWrap.appendChild(projectLabel);
  projectSelectWrap.appendChild(projectSelect);
  form.appendChild(projectSelectWrap);

  const priorityWrap = make("div");
  priorityWrap.classList.add("form-element-wrap");

  const priorityLabel = make("label");
  priorityLabel.for = "priority";
  priorityLabel.innerText = "Priority";
  priorityLabel.classList.add("form-label");

  const priority = make("input");
  priority.type = "range";
  priority.id = "priority";
  priority.min = "1";
  priority.max = "5";
  priority.value = "1";
  priority.placeholder = "priority";

  priorityWrap.appendChild(priorityLabel);
  priorityWrap.appendChild(priority);
  form.appendChild(priorityWrap);

  const submitButton = make("button");
  submitButton.id = "submitTodo";
  submitButton.innerText = "Add Task";
  submitButton.addEventListener("click", getFormDataAndCreate);
  form.appendChild(submitButton);

  const closeFormButton = make("button");
  closeFormButton.id = "#closeTaskForm";
  closeFormButton.innerText = "Cancel";
  closeFormButton.classList.add("cancel-button");

  closeFormButton.onclick = removeTaskForm;
  form.appendChild(closeFormButton);

  if (condition !== "edit") {
    projectWrap.prepend(form);
    return form;
  }
  if (condition === "edit") {
    element.parentElement.insertBefore(form, element.nextSibling);
    closeFormButton.removeEventListener("click", removeTaskForm);
    closeFormButton.onclick = removeEditForm;
    return form;
  }
}

//Close Task Form
function removeTaskForm() {
  event.preventDefault();
  document.querySelector("#newTaskForm").remove();
}
//Close Project Form
function removeProjectForm() {
  event.preventDefault();
  document.querySelector("#newProjectForm").remove();
}

//add all task to dom (from project or localStorage)
function populate(project) {
  clearCurrentProject();
  if (project == completed) {
    completed.forEach((task) => displayCompletedTask(task));
    displayCurrentTask("Completed");
    return;
  }
  displayCurrentTask(project);
  toDoList.forEach((task) => {
    if (project === "all") return displayTodo(task);
    if (task.project == project) {
      return displayTodo(task);
    }
  });
}
//Clear tasks/projects from Dom
function clearCurrentProject() {
  const header = document.querySelector("#projectDisplayHeader");
  if (!header) return;
  header.remove();
  projectWrap.innerText = "";
}
//View all tasks
function viewAllTasks() {
  populate("all");
}
//View Completed Tasks
function viewCompleted() {
  populate(completed);
}
//Project Display
function displayCurrentTask(project) {
  const header = make("h2");
  header.id = "projectDisplayHeader";
  header.innerText = `Project: ${project}`;
  if (project === "all") header.innerText = "All tasks";
  content.prepend(header);
}

//Project selector
function projectSelectorDisplay() {
  projectSelector.innerText = "";
  projects.forEach((project) => {
    if (project == "all") return;
    const projectButton = make("div");
    projectButton.classList.add("project-button");
    projectButton.id = `${project}Button`;
    projectButton.innerText = `${project}`;
    projectButton.addEventListener("click", projectSelectorClick);
    projectSelector.appendChild(projectButton);
  });
}

//Project selector click event handler
function projectSelectorClick() {
  populate(event.target.innerText);
}

//add tasks to dom
function displayTodo(toDo) {
  const wrapper = make("div");
  wrapper.classList.add("todo-wrap");
  wrapper.id = toDo.id;
  wrapper.classList.add("new-task-animation");

  const title = make("div");
  title.innerText = toDo.title;
  title.classList.add("title");

  const description = make("div");
  description.innerText = toDo.description;
  description.classList.add("description");

  const dueDate = make("div");
  dueDate.innerText = `Due: ${formatRelative(
    parseISO(toDo.dueDate),
    new Date()
  )}`;
  dueDate.classList.add("dueDate");

  const priority = make("div");
  priority.innerText = `Priority: ${toDo.priority}`;
  priority.classList.add("priority");

  const buttonWrapper = make("div");
  buttonWrapper.classList.add("button-wrap");

  const completeButton = make("button");
  completeButton.innerText = "Complete";
  completeButton.onclick = taskCompleted;

  const editButton = make("button");
  editButton.innerText = "Edit";
  editButton.onclick = editTodoForm;

  const removeButton = make("button");
  removeButton.classList.add("cancel-button");
  removeButton.innerText = "Remove";
  removeButton.onclick = removeTodo;

  buttonWrapper.appendChild(completeButton);
  buttonWrapper.appendChild(editButton);
  buttonWrapper.appendChild(removeButton);

  wrapper.appendChild(title);
  wrapper.appendChild(description);
  wrapper.appendChild(dueDate);
  wrapper.appendChild(priority);
  wrapper.appendChild(buttonWrapper);

  projectWrap.prepend(wrapper);
}

//display completed task
function displayCompletedTask(task) {
  const wrapper = make("div");
  wrapper.classList.add("todo-wrap");
  wrapper.id = task.id;

  const title = make("div");
  title.innerText = task.title;
  title.classList.add("title");

  const description = make("div");
  description.innerText = task.description;
  description.classList.add("description");

  const dueDate = make("div");
  dueDate.innerText = `Due Date: ${formatRelative(
    parseISO(task.dueDate),
    new Date()
  )}`;
  dueDate.classList.add("dueDate");

  const completedTime = make("div");
  completedTime.innerText = `Completed: ${formatRelative(
    parseISO(task.completedTime),
    new Date()
  )}`;
  completedTime.classList.add("completedTime");

  const priority = make("div");
  priority.innerText = `Priority: ${task.priority}`;
  priority.classList.add("priority");

  const buttonWrapper = make("div");
  buttonWrapper.classList.add("button-wrap");

  const removeButton = make("button");
  removeButton.classList.add("cancel-button");
  removeButton.innerText = "Remove";
  removeButton.onclick = removeCompletedTask;

  buttonWrapper.appendChild(removeButton);

  wrapper.appendChild(title);
  wrapper.appendChild(description);
  wrapper.appendChild(dueDate);
  wrapper.appendChild(completedTime);
  wrapper.appendChild(priority);
  wrapper.appendChild(buttonWrapper);

  projectWrap.prepend(wrapper);
}
//remove task from dom
function removeTodo(e) {
  const todoItem = e.target.parentElement.parentElement;
  todoItem.remove();
  deleteTodo(todoItem.id);
}

//completed task
function taskCompleted(e) {
  const todoItem = e.target.parentElement.parentElement;
  const todo = findTodo(todoItem.id);
  todo.isDone = true;
  todo.completedTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  completed.push(todo);
  todoItem.remove();
  deleteTodo(todoItem.id);
}

//remove completed task

function removeCompletedTask(e) {
  const task = e.target.parentElement.parentElement;
  const index = findCompletedTask(task.id);
  console.log(index);
  completed.splice(index, 1);
  task.remove();
  saveToLocal(toDoList, projects, completed);
}

//make edit task form
function editTodoForm(e) {
  const wrapper = e.target.parentElement.parentElement;
  console.dir(wrapper);
  const item = findTodo(wrapper.id);
  const form = makeTodoForm("edit", wrapper);
  form.title.value = item.title;
  form.description.value = item.description;
  form.dueDate.value = item.dueDate;
  form.priority.value = item.priority;
  form.submitTodo.innerText = "Save Changes";
  form.submitTodo.removeEventListener("click", getFormDataAndCreate);
  form.submitTodo.addEventListener("click", getFormDataAndUpdate.bind(item));
}

function removeEditForm(e) {
  removeTaskForm();
}
//update changes to tasks on DOM item
function updateTodoDisplay(item) {
  const todo = document.getElementById(item.id);
  const title = todo.querySelector(".title");
  const description = todo.querySelector(".description");
  const dueDate = todo.querySelector(".dueDate");
  const priority = todo.querySelector(".priority");
  title.innerText = item.title;
  description.innerText = item.description;
  dueDate.innerText = `Due: ${item.dueDate}`;
  priority.innerText = `Priority: ${item.priority}`;
}

//Create new project form
function createNewProjectForm() {
  if (document.querySelector("#newProjectForm"))
    document.querySelector("#newProjectForm").remove();
  if (document.querySelector("#newTaskForm"))
    document.querySelector("#newTaskForm").remove();

  const projectForm = make("form");
  projectForm.id = "newProjectForm";
  projectForm.classList.add("new-form-animation");

  const projectTitleWrap = make("div");
  projectTitleWrap.classList.add("form-element-wrap");

  const projectTitleLabel = make("label");
  projectTitleLabel.for = "projectTitle";
  projectTitleLabel.classList.add("form-label");
  projectTitleLabel.innerText = "Project Name";

  const projectTitle = make("input");
  projectTitle.type = "text";
  projectTitle.id = "projectTitle";
  projectTitleWrap.appendChild(projectTitleLabel);
  projectTitleWrap.appendChild(projectTitle);

  const createProjectButton = make("button");
  createProjectButton.addEventListener("click", getProjectFormData);
  createProjectButton.innerText = "Create Project";

  const closeFormButton = make("button");
  closeFormButton.classList.add("cancel-button");
  closeFormButton.onclick = removeProjectForm;

  closeFormButton.innerText = "Cancel";

  projectForm.appendChild(projectTitleWrap);
  projectForm.appendChild(createProjectButton);
  projectForm.appendChild(closeFormButton);
  projectWrap.prepend(projectForm);
}

//Sort tasks by priority
function displayTasksByPriority() {
  const sortedTasks = sortTasksByPriority();
  projectWrap.innerHTML = "";
  sortedTasks.forEach((task) => displayTodo(task));
}

//utility functions

//create dom element shorthand
function make(el) {
  return document.createElement(el);
}
//seed app with 6 tasks
function seed() {
  makeTodo("Clean Room", "closet, laundry, room", "2021-07-23", "2");
  makeTodo("Dishes", "", "2021-07-25", "3");
  makeTodo("Feed Cat", "1cup", "2021-07-23", "5");
  makeTodo("Fight Crime", "Show no mercy", "2021-07-26", "1");
  makeTodo("Read book", "at least one chapter", "2021-07-24", "5");
  makeTodo("Odin Project", "Oh yeah baby", "2021-07-27", "4");
}

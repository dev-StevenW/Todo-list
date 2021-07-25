//Select which project to view
//when new project is created only display if viewing current project (or switch to that project)?
//View all tasks
//sort tasks by project
//sort tasks by priority (within all tasks and project view)

const content = document.querySelector("#content");
const makeTodoButton = document.querySelector("#newTodo");
makeTodoButton.addEventListener("click", makeTodoForm);
const newProjectButton = document.querySelector("#newProject");
newProjectButton.addEventListener("click", createNewProjectForm);
const projectWrap = document.querySelector("#projectWrap");
const { toDoList, projects } = hasLocalStorage();

//Display all todos on page load
window.onload = function () {
  populate("default");
};

//*******************************************************************************
//*********************************LOCAL STORAGE*********************************

//Check if localStorage already  exists
function hasLocalStorage() {
  //If it does parse and return them
  if (localStorage.toDoList) {
    const toDoList = JSON.parse(localStorage.getItem("toDoList"));
    const projects = JSON.parse(localStorage.getItem("projects"));
    return { toDoList, projects };
    //If no localStorage exists create default project list and empty todo list
  } else {
    const toDoList = [];
    const projects = ["default"];
    return { toDoList, projects };
  }
}

//save to localStorage
function saveToLocal(toDoList, projects) {
  localStorage.setItem("toDoList", JSON.stringify(toDoList));
  localStorage.setItem("projects", JSON.stringify(projects));
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
    isDone: false,
    project: project || "default",
  };
  //push item into toDoList array
  toDoList.push(toDo);
  //display todo on DOM **TODO: if viewing current project**
  displayTodo(toDo);
  //save toDoList to local storage
  saveToLocal(toDoList, projects);
}

//find particular task by id
function findTodo(id) {
  return toDoList.find((el) => el.id === id);
}
//find particular tasks index in the toDoList array
function findTodoIndex(id) {
  return toDoList.findIndex((el) => el.id === id);
}

//remove task from toDoList array
function deleteTodo(id) {
  index = findTodoIndex(id);
  toDoList.splice(index, 1);
  saveToLocal(toDoList, projects);
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
  this.title = data.title;
  this.description = data.description;
  this.dueDate = data.dueDate;
  this.priority = data.priority;
  updateTodoDisplay(this);
  event.target.parentElement.remove();
  saveToLocal(toDoList, projects);
}

//*******************************************************************************
//***********************************PROJECTS************************************

function createNewProject(project) {
  projects.push(project);
  saveToLocal(toDoList, projects);
}

function getProjectFormData() {
  event.preventDefault();
  const project = document.querySelector("#projectTitle").value;
  createNewProject(project);
  event.target.parentElement.remove();
}

//*******************************************************************************
//***********************************DOM STUFF***********************************
//make task form
function makeTodoForm() {
  if (document.querySelector("#form")) document.querySelector("#form").remove();
  const form = make("form");
  form.id = "form";

  const title = make("input");
  title.type = "text";
  title.id = "title";
  form.appendChild(title);

  const description = make("input");
  description.type = "text";
  description.id = "description";
  form.appendChild(description);

  const dueDate = make("input");
  dueDate.type = "date";
  dueDate.id = "dueDate";
  form.appendChild(dueDate);

  const priority = make("input");
  priority.type = "range";
  priority.id = "priority";
  priority.min = "1";
  priority.max = "5";
  form.appendChild(priority);

  const projectSelect = make("select");
  projectSelect.id = "project";
  projects.forEach((project) => {
    const option = make("option");
    option.value = `${project}`;
    option.innerText = `${project}`;
    projectSelect.appendChild(option);
  });
  form.appendChild(projectSelect);

  const submitButton = make("button");
  submitButton.id = "submitTodo";
  submitButton.innerText = "Add Todo";
  submitButton.addEventListener("click", getFormDataAndCreate);
  form.appendChild(submitButton);

  content.prepend(form);
  return form;
}
//add all task to dom (from project or localStorage)
function populate(project) {
  displayCurrentTask(project);
  toDoList.forEach((task) => {
    if (task.project == project) {
      return displayTodo(task);
    }
  });
}

//Project Display
function displayCurrentTask(project) {
  const header = make("h2");
  header.innerText = `Currently viewing the ${project} project`;
  content.prepend(header);
}
//add tasks to dom
function displayTodo(toDo) {
  const wrapper = make("div");
  wrapper.classList.add("todo-wrap");
  wrapper.id = toDo.id;

  const title = make("div");
  title.innerText = toDo.title;
  title.classList.add("title");

  const description = make("div");
  description.innerText = toDo.description;
  description.classList.add("description");

  const dueDate = make("div");
  dueDate.innerText = toDo.dueDate;
  dueDate.classList.add("dueDate");

  const priority = make("div");
  priority.innerText = toDo.priority;
  priority.classList.add("priority");

  const completeButton = make("button");
  completeButton.innerText = "Complete";

  const editButton = make("button");
  editButton.innerText = "Edit";
  editButton.addEventListener("click", editTodoForm);

  const removeButton = make("button");
  removeButton.innerText = "Remove";
  removeButton.addEventListener("click", removeTodo);

  wrapper.appendChild(title);
  wrapper.appendChild(description);
  wrapper.appendChild(dueDate);
  wrapper.appendChild(priority);
  wrapper.appendChild(completeButton);
  wrapper.appendChild(editButton);
  wrapper.appendChild(removeButton);

  projectWrap.appendChild(wrapper);
}

//remove task from dom
function removeTodo(e) {
  const todoItem = e.target.parentElement;
  todoItem.remove();
  deleteTodo(todoItem.id);
}

//make edit task form
function editTodoForm(e) {
  const item = findTodo(e.target.parentElement.id);
  const form = makeTodoForm();
  form.title.value = item.title;
  form.description.value = item.description;
  form.dueDate.value = item.dueDate;
  form.priority.value = item.priority;
  form.submitTodo.innerText = "Save Changes";
  form.submitTodo.removeEventListener("click", getFormDataAndCreate);
  form.submitTodo.addEventListener("click", getFormDataAndUpdate.bind(item));
}
//update changes to tasks on DOM item
function updateTodoDisplay(item) {
  const todo = document.getElementById(item.id);
  title = todo.querySelector(".title");
  description = todo.querySelector(".description");
  dueDate = todo.querySelector(".dueDate");
  priority = todo.querySelector(".priority");
  title.innerText = item.title;
  description.innerText = item.description;
  dueDate.innerText = item.dueDate;
  priority.innerText = item.priority;
}

//Create new project form
function createNewProjectForm() {
  const projectForm = make("form");
  projectForm.id = "newProjectForm";

  const projectTitle = make("input");
  projectTitle.type = "text";
  projectTitle.id = "projectTitle";

  const createProjectButton = make("button");
  createProjectButton.addEventListener("click", getProjectFormData);
  createProjectButton.innerText = "Create Project";

  projectForm.appendChild(projectTitle);
  projectForm.appendChild(createProjectButton);
  projectWrap.prepend(projectForm);
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

import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
  }

  componentWillMount() {
    this.fetchTasks();
  }

  fetchTasks = () => {
    fetch("/apis/")
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          todoList: data,
        });
      });
  };

  handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        [name]: value,
      },
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const csrftoken = this.getCookie("csrftoken");
    let url = "/apis/";
    let method = "POST";
    if (this.state.editing === true) {
      url = `/apis/${this.state.activeItem.id}/`;
      method = "PUT";
      this.setState({
        editing: false,
      });
    }
    fetch(url, {
      method: method,
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((res) => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch((err) => console.log(err));
  };

  getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  startEdit = (todo) => {
    this.setState({
      activeItem: todo,
      editing: true,
    });
  };

  deleteItem = (todo) => {
    const csrftoken = this.getCookie("csrftoken");

    fetch(`/apis/${todo.id}/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    })
      .then((res) =>
        this.setState({
          todoList: this.state.todoList.filter((item) => item.id !== todo.id),
        })
      )
      .catch((err) => console.log(err));
  };

  handleCompleted = (todo, index) => {
    const { todoList } = this.state;
    todo.completed = !todo.completed;
    todoList[index] = todo;
    const csrftoken = this.getCookie("csrftoken");
    fetch(`/apis/${todo.id}/`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(todo),
    }).then((res) =>
      this.setState({
        todoList: todoList,
      })
    );
  };

  render() {
    const { todoList } = this.state;
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form id="form" onSubmit={this.handleSubmit}>
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input
                    onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    type="text"
                    value={this.state.activeItem.title}
                    name="title"
                    placeholder="填入任务"
                  ></input>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    id="submit"
                    className="btn btn-warning"
                    type="submit"
                    name="Add"
                  ></input>
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
            {todoList.map((todo, index) => (
              <div className="task-wrapper flex-wrapper" key={todo.id}>
                <div
                  onClick={() => this.handleCompleted(todo, index)}
                  style={{ flex: 7 }}
                >
                  {!todo.completed ? (
                    <span>{todo.title}</span>
                  ) : (
                    <strike>{todo.title}</strike>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span>
                    <button
                      onClick={() => this.startEdit(todo)}
                      className="btn btn-sm btn-outline-info"
                    >
                      编辑
                    </button>
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <span>
                    <button
                      onClick={() => this.deleteItem(todo)}
                      className="btn btn-sm btn-outline-dark delete"
                    >
                      删除
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

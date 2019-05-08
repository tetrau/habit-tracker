import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from "react";
import 'bootstrap';
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import '@fortawesome/fontawesome-free/css/all.min.css'

class Habit extends React.Component {
  constructor(props) {
    super(props);
    this.incOne = this.incOne.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
  }

  timestamp() {
    return (new Date()).getTime() / 1000;
  }

  async incOne() {
    let habit = this.props.habit;
    let todayJournal = habit.journal[this.props.dateString];
    if (todayJournal === undefined) {
      habit.journal[this.props.dateString] = {
        goal: this.props.habit.goal,
        activity: [this.timestamp()]
      }
    } else {
      habit.journal[this.props.dateString].activity.push(this.timestamp())
    }
    await this.props.modifiyHabit(habit);
  }

  clickHandler(e) {
    let rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < (rect.left + rect.right) / 2) {
      this.props.changeMode({ habitId: this.props.habit.id, mode: "config" })
    } else {
      this.incOne()
    }
  }

  activity() {
    let journal = this.props.habit.journal[this.props.dateString];
    if (journal === undefined) {
      return [];
    } else {
      return journal.activity;
    }
  }

  goal() {
    let journal = this.props.habit.journal[this.props.dateString];
    if (journal === undefined) {
      return this.props.habit.goal;
    } else {
      return journal.goal;
    }
  }

  render() {
    let progressBarWidth = Math.min(100, Math.ceil((this.activity().length / this.goal()) * 100));
    let progressBarStyle = { "width": progressBarWidth.toString() + "%" }
    let habitDisplay = (<div className="row">
      <div className="col-12">
        <div className="card mb-2" onClick={this.clickHandler}>
          <div className="card-body">
            <h5 className="mb-0">{this.props.habit.name}</h5>
            <div className="progress">
              <div className={progressBarWidth === 100 ? "progress-bar bg-success" : "progress-bar"} role="progressbar" style={progressBarStyle}>
                {this.activity().length.toString() + "/" + this.goal().toString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
    return habitDisplay;
  }
}

class HabitConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameValid: true,
      goalValid: true
    }
    this.saveHabit = this.saveHabit.bind(this);
    this.clickSave = this.clickSave.bind(this);
    this.clickUndo = this.clickUndo.bind(this);
    this.clickDelete = this.clickDelete.bind(this);
  }

  async saveHabit() {
    this.setState({
      nameValid: true,
      goalValid: true
    });
    let name = document.getElementById("habit-name").value || this.props.habit.name;
    if (name.length === 0 || typeof name !== "string") {
      this.setState({ nameValid: false })
      return;
    }
    let goal = Number(document.getElementById("habit-goal").value) || this.props.habit.goal;
    if (!Number.isInteger(goal) || goal <= 0) {
      this.setState({ goalValid: false })
      return;
    }
    let habit = this.props.habit;
    let todayJournal = habit.journal[this.props.dateString];
    habit.name = name;
    habit.goal = goal;
    if (todayJournal !== undefined) {
      todayJournal.goal = goal;
    }
    await this.props.modifiyHabit(habit)
    this.props.changeMode({ mode: "normal" })
  }

  async clickSave() {
    await this.saveHabit();

  }
  async clickDelete() {
    let habitId = this.props.habit.id;
    let confirmDelete = window.confirm("Confirm Delete habit -" + this.props.habit.name + "- ?");
    if (confirmDelete) {
      await this.props.deleteHabit(habitId);
    }

  }
  async clickUndo() {
    let habit = this.props.habit;
    let dateString = this.props.dateString;
    if (habit.journal[dateString] === undefined || habit.journal[dateString].activity.length === 0) {
      return;
    } else {
      habit.journal[dateString].activity.pop();
      await this.props.modifiyHabit(habit);
    }
  }

  render() {
    let activity = this.props.habit.journal[this.props.dateString];
    if (activity === undefined) {
      activity = []
    } else {
      activity = activity.activity;
    }
    let nameClass = "form-control" + (this.state.nameValid ? "" : " is-invalid");
    let goalClass = "form-control" + (this.state.goalValid ? "" : " is-invalid");
    return (<React.Fragment>
      <div className="row">
        <div className="col-12">
          <label htmlFor="habit-name" className="mb-0">Name</label>
          <input id="habit-name" className={nameClass} placeholder={this.props.habit.name} />
          {!this.state.nameValid && (<div className="invalid-feedback">
            Please provide a name.
          </div>)}
          <label htmlFor="habit-goal" className="mb-0">Goal</label>
          <input id="habit-goal" className={goalClass} min="0" type="number" placeholder={this.props.habit.goal} />
          {!this.state.goalValid && (<div className="invalid-feedback">
            Please provide a valid goal (positive integer).
          </div>)}
          <div className="d-flex flex-row-reverse mt-2">
            <button className="btn btn-primary" onClick={this.clickSave}>Save</button>
            <button className="btn btn-danger mr-2" onClick={this.clickDelete}>Delete Habit</button>
          </div>
        </div>
      </div>
      {activity.length > 0 &&
        (<React.Fragment><div className="row mt-2">
          <div className="col-12">
            <ul className="list-group">
              {activity.map((a, idx) => {
                return <li className="list-group-item" key={idx}>{(new Date(a * 1000)).toLocaleString()}</li>
              })}
            </ul>
          </div>
        </div>
          <div className="row mt-2">
            <div className="col-12">
              <div className="d-flex flex-row-reverse">
                <button className="btn btn-primary" onClick={this.clickUndo}>Undo Last Activity</button>
              </div>
            </div>
          </div></React.Fragment>)}
    </React.Fragment>)
  }
}

class HabitCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameValid: true,
      goalValid: true
    }
    this.clickSave = this.clickSave.bind(this);
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async clickSave() {
    this.setState({
      nameValid: true,
      goalValid: true
    });
    let name = document.getElementById("habit-name").value
    if (name.length === 0 || typeof name !== "string") {
      this.setState({ nameValid: false })
      return;
    }
    let goal = Number(document.getElementById("habit-goal").value)
    if (!Number.isInteger(goal) || goal <= 0) {
      this.setState({ goalValid: false })
      return;
    }
    let habit = { "goal": goal, journal: {}, "name": name, id: this.uuidv4() }
    await this.props.createHabit(habit);
    this.props.changeMode({ mode: "normal" })
  }

  render() {
    let nameClass = "form-control" + (this.state.nameValid ? "" : " is-invalid");
    let goalClass = "form-control" + (this.state.goalValid ? "" : " is-invalid");
    return (
      <div className="form-row">
        <div className="col-12">
          <label htmlFor="habit-name" className="mb-0">Name</label>
          <input id="habit-name" className={nameClass} placeholder="habit name" />
          {!this.state.nameValid && (<div className="invalid-feedback">
            Please provide a name.
          </div>)}
          <label htmlFor="habit-goal" className="mb-0">Goal</label>
          <input id="habit-goal" className={goalClass} min="0" type="number" placeholder="daily goal" />
          {!this.state.goalValid && (<div className="invalid-feedback">
            Please provide a valid goal (positive integer).
          </div>)}
          <div className="d-flex flex-row-reverse">
            <button className="btn btn-primary mt-2" onClick={this.clickSave}>Save</button>
          </div>
        </div>
      </div>
    )
  }
}

class AppConfig extends Component {
  constructor(props) {
    super(props);
    this.clearDatabase = this.clearDatabase.bind(this);
  }

  async clearDatabase() {
    let confirmDelete = window.confirm("Confirm delete the database content?");
    if (confirmDelete) {
      await this.props.database.clear("habits");
      this.props.clearHabit()
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col">
          <div className="btn btn-outline-danger btn-lg btn-block" onClick={this.clearDatabase}>Clear Database</div>
        </div>
      </div>
    )

  }
}

class NavBar extends React.Component {
  render() {
    return (
      <div className="navbar navbar-light bg-light mb-2">
        <div className="container d-flex justify-content-between">
          <a className="btn btn-outline-link btn-sm"
            onClick={this.props.clickLeft}>&lt;</a>
          <a className="navbar-brand">{this.props.dateString}</a>
          <a className="btn btn-outline-link btn-sm"
            onClick={this.props.clickRight}
            style={{ visibility: this.props.hideRight ? 'hidden' : 'visible' }}>&gt;</a>
        </div>
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { habits: {}, date: new Date(), mode: { mode: "normal" } };
    this.dateString = this.dateString.bind(this);
    this.dateToDateString = this.dateToDateString.bind(this);
    this.modifiyHabit = this.modifiyHabit.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.createHabit = this.createHabit.bind(this);
    this.deleteHabit = this.deleteHabit.bind(this);
  }

  dateToDateString(date) {
    let year = date.getFullYear().toString().padStart(4, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  dateString() {
    return this.dateToDateString(this.state.date)
  }

  changeMode(mode) {
    this.setState({ mode })
  }

  async modifiyHabit(newHabit) {
    await this.database.put("habits", newHabit);
    let habits = this.state.habits;
    habits[newHabit.id] = newHabit
    this.setState({ habits })
  }

  async deleteHabit(habitId) {
    await this.database.delete("habits", habitId);
    let habits = this.state.habits;
    delete habits[habitId];
    this.setState({ habits, mode: { mode: "normal" } })
  }

  async createHabit(habit) {
    await this.database.add("habits", habit);
    let habits = this.state.habits;
    habits[habit.id] = habit
    this.setState({ habits })
  }

  async componentDidMount() {
    let database = await openDB('habitTracker', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log("create database")
        db.createObjectStore('habits', { "keyPath": "id" });
      }
    });
    this.database = database;
    let habitCount = await database.count("habits");
    if (habitCount === 0) {
      let initData = []
      let tx = this.database.transaction('habits', 'readwrite');
      let store = tx.objectStore('habits');
      await Promise.all(initData.map(function (item) {
        return store.add(item);
      }));
      await tx.done
      let habits = {}
      initData.forEach(h => habits[h.id] = h)
      this.setState({ habits });
    } else {
      let initData = await this.database.getAll("habits");
      let habits = {}
      initData.forEach(h => habits[h.id] = h)
      this.setState({ habits });
    }
  }

  render() {
    let habitDisplay = []
    for (let h in this.state.habits) {
      let elem = <Habit
        habit={this.state.habits[h]}
        dateString={this.dateString()} key={h}
        modifiyHabit={this.modifiyHabit}
        changeMode={this.changeMode}></Habit>
      habitDisplay.push(elem)
    }
    let mainContent;
    let navBar;
    let dateChangeNaveBar = (
      <NavBar
        clickLeft={() => {
          let newDate = this.state.date;
          newDate.setDate(this.state.date.getDate() - 1);
          this.setState({ date: newDate });
        }}
        clickRight={() => {
          let newDate = this.state.date;
          newDate.setDate(this.state.date.getDate() + 1);
          this.setState({ date: newDate });
        }}
        hideRight={false}
        dateString={this.dateString()}>
      </NavBar>);
    let returnNvaBar = (
      <NavBar
        clickLeft={() => this.changeMode({ mode: "normal" })}
        clickRight={() => { }}
        hideRight={true}
        dateString={this.dateString()}></NavBar>)
    if (this.state.mode.mode === "normal") {
      mainContent = (<React.Fragment>
        {habitDisplay}
        <div className="row">
          <div className="col-6 pr-1">
            <div className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.changeMode({ mode: "appConfig" })}>
              <i className="fas fa-cog"></i></div>
          </div>
          <div className="col-6 pl-1">
            <div className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.changeMode({ mode: "create" })}>
              <i className="fas fa-plus"></i></div>
          </div>
        </div></React.Fragment>);
      navBar = dateChangeNaveBar;
    } else if (this.state.mode.mode === "config") {
      mainContent = (<HabitConfig habit={this.state.habits[this.state.mode.habitId]}
        dateString={this.dateString()}
        modifiyHabit={this.modifiyHabit}
        changeMode={this.changeMode}
        deleteHabit={this.deleteHabit}></HabitConfig>);
      navBar = returnNvaBar;
    } else if (this.state.mode.mode === "create") {
      mainContent = (<HabitCreate changeMode={this.changeMode} createHabit={this.createHabit} ></HabitCreate>)
      navBar = returnNvaBar;
    } else if (this.state.mode.mode === "appConfig") {
      mainContent = (<AppConfig
        clearHabit={() => { this.setState({ mode: { mode: "normal" }, habits: {} }) }}
        database={this.database}></AppConfig>)
      navBar = returnNvaBar;
    }
    return (<div className="container">{navBar}{mainContent}</div>)
  }
}

export default App;
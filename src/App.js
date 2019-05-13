import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from "react";
import 'bootstrap';
import { openDB } from 'idb';
import Octicon, { Gear, Plus } from '@githubprimer/octicons-react'
import Habit from "./habit-card"
import HabitDetail from "./habit-detail"
import HabitCreate from "./habit-create"
import AppConfig from "./app-config"

class NavBar extends React.Component {
  render() {
    return (
      <div className="navbar navbar-light bg-light mb-2">
        <div className="container d-flex justify-content-between">
          <a className="btn btn-outline-link btn-sm"
            onClick={this.props.clickLeft}>&lt;</a>
          <a className="navbar-brand" onClick={this.props.gotoToday}>{this.props.dateString}</a>
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
        dateString={this.dateString()}
        gotoToday={() => this.setState({ date: new Date() })}>
      </NavBar >);
    let returnNvaBar = (
      <NavBar
        clickLeft={() => this.changeMode({ mode: "normal" })}
        clickRight={() => { }}
        hideRight={true}
        dateString={this.dateString()}
        gotoToday={() => this.setState({ date: new Date() })}></NavBar>)
    if (this.state.mode.mode === "normal") {
      mainContent = (<React.Fragment>
        {habitDisplay}
        <div className="row">
          <div className="col-6 pr-1">
            <div className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.changeMode({ mode: "appConfig" })}>
              <Octicon icon={Gear} size='medium'></Octicon>
            </div>
          </div>
          <div className="col-6 pl-1">
            <div className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.changeMode({ mode: "create" })}>
              <Octicon icon={Plus} size='medium'></Octicon>
            </div>
          </div>
        </div></React.Fragment>);
      navBar = dateChangeNaveBar;
    } else if (this.state.mode.mode === "config") {
      mainContent = (<HabitDetail habit={this.state.habits[this.state.mode.habitId]}
        dateString={this.dateString()}
        modifiyHabit={this.modifiyHabit}
        changeMode={this.changeMode}
        deleteHabit={this.deleteHabit}></HabitDetail>);
      navBar = returnNvaBar;
    } else if (this.state.mode.mode === "create") {
      mainContent = (<HabitCreate changeMode={this.changeMode} createHabit={this.createHabit} ></HabitCreate>)
      navBar = returnNvaBar;
    } else if (this.state.mode.mode === "appConfig") {
      mainContent = (<AppConfig
        clearHabit={() => { this.setState({ mode: { mode: "normal" }, habits: {} }) }}
        database={this.database}
        habits={this.state.habits}></AppConfig>)
      navBar = returnNvaBar;
    }
    return (<div className="container">{navBar}{mainContent}</div>)
  }
}

export default App;
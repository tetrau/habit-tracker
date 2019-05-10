import React, { Component } from "react";

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
          <a className="navbar-brand" onClick={this.props.gotoToday}>{this.props.dateString}</a>
          <a className="btn btn-outline-link btn-sm"
            onClick={this.props.clickRight}
            style={{ visibility: this.props.hideRight ? 'hidden' : 'visible' }}>&gt;</a>
        </div>
      </div>
    )
  }
}
export default HabitCreate;
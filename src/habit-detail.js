import React, { Component } from "react";

class HabitDetail extends Component {
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

export default HabitDetail;
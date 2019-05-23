import React, { Component } from "react";
import HabitEditor from "./habit-editor";

class HabitDetail extends Component {
  constructor(props) {
    super(props);
    this.setHabit = this.setHabit.bind(this);
    this.clickUndo = this.clickUndo.bind(this);
    this.deleteHabit = this.deleteHabit.bind(this);
  }

  async setHabit(newHabit) {
    let habit = this.props.habit;
    let todayJournal = habit.journal[this.props.dateString];
    habit.name = newHabit.name;
    habit.goal = newHabit.goal;
    if (todayJournal !== undefined) {
      todayJournal.goal = newHabit.goal;
    }
    await this.props.modifiyHabit(habit)
    this.props.changeMode({ mode: "normal" })
  }


  async deleteHabit() {
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
    return (
      <React.Fragment>
        <HabitEditor presetName={this.props.habit.name} presetGoal={this.props.habit.goal.toString()} setHabit={this.setHabit} deleteHabit={this.deleteHabit} displayDelete={true} />
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
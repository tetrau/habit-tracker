import React, { Component } from "react";


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
  export default Habit;
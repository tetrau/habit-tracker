import React, { Component } from "react";
import HabitEditor from "./habit-editor";

class HabitCreate extends Component {
  constructor(props) {
    super(props);
    this.createHabit = this.createHabit.bind(this);
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  async createHabit(newHabit) {
    let habit = { "goal": newHabit.goal, journal: {}, "name": newHabit.name, id: this.uuidv4() }
    await this.props.createHabit(habit);
    this.props.changeMode({ mode: "normal" })
  }

  render() {
    return <HabitEditor setHabit={this.createHabit} />
  }
}

export default HabitCreate;
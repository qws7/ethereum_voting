import React, { Component } from "react";
import { Header } from "semantic-ui-react";

class Information extends Component {
    Convert_to_Timestamp(timestamp) {
        const param = {
            day: "2-digit",
            year: "numeric",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        };
    
        return new Date(timestamp * 1000).toLocaleDateString("da", param);
    }
    when_voting(time_start, time_end) {
        const time_current = Math.round(Date.now() / 1000);
        try {
            if (time_start > time_current) {
                return "Будущие";
            } else if (time_start < time_current && time_end > time_current) {
                return "Проводятся";
            } else {
                return "Прошедшие";
            }
        } catch {
            return "error";
        }
    }
    render() {
        return (
            <Header as="h2" textAlign="center">
                {this.props.title}
                <Header.Subheader>{this.props.description}</Header.Subheader>
                <Header.Subheader>
                    {this.when_voting(
                        this.props.time_start,
                        this.props.endTime
                    ) === "Прошедшие" ? (
                        <React.Fragment>
                            С {" "}
                                {this.Convert_to_Timestamp(this.props.time_start)}
                               {" "}
                            до{" "}
                                {this.Convert_to_Timestamp(this.props.endTime)}
                        </React.Fragment>
                    ) : this.when_voting(
                          this.props.time_start,
                          this.props.endTime
                      ) === "Проводятся" ? (
                        <React.Fragment>
                            Конец{" "}
                                {this.Convert_to_Timestamp(this.props.endTime)}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            Начало{" "}
                                {this.Convert_to_Timestamp(this.props.time_start)}
                                {" "}
                            , до{" "}
                                {this.Convert_to_Timestamp(this.props.endTime)}
                        </React.Fragment>
                    )}
                </Header.Subheader>
            </Header>
        );
    }
}

export default Information;

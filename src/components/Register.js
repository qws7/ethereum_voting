import React, { Component } from "react";
import { Header, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends Component {
    render() {
        return (
            <Segment placeholder color="yellow">
                <Header icon>
                    Чтобы зарегистрироваться на принятие участие в голосование вам нужно 
                    обратиться в орган голосования,взяв с собой паспорт и Ethereum адрес.
                </Header>
                <Button as={Link}  to={`/`} color="yellow">
                    <Button.Content visible>Главная страница</Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Register;

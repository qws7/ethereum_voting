import React, { Component } from "react";
import { Header, Icon, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Error extends Component {
    render() {
        return (
            <Segment placeholder color="red">
                <Header icon>
                    Извините,мы не нашли данную страницу.
                </Header>
                <Button as={Link}  to={`/`} color="red">
                    <Button.Content visible>Главная страница</Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Error;

import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "./ProductSelectionScreen.css";

import productData from "./productData";

function ProductSelectionScreen({
    onSelectProduct
}) {

    return (

        <Container
            fluid
            className="product-selection-screen"
        >

            <div
                className="product-selection-header"
            >

                <h1>
                    Select Product Type
                </h1>

                <p>
                    Choose how you would like
                    to configure your product.
                </p>

            </div>

            <Row
                className="justify-content-center g-4"
            >

                {productData.map(product => {

                    const Icon = product.icon;

                    return (

                        <Col
                            key={product.value}
                            xs={12}
                            md={6}
                            lg={4}
                        >

                            <Card
                                className="product-card"
                                onClick={() =>
                                    onSelectProduct(
                                        product
                                    )
                                }
                            >

                                <div className="product-card-icon-area">

                                    <div className="product-card-icon">

                                        <Icon
                                            size={80}
                                        />

                                    </div>

                                </div>

                                <Card.Body
                                    className="product-card-body"
                                >

                                    <div className="product-card-title">
                                        {product.title}
                                    </div>

                                    <div className="product-card-description">
                                        {product.description}
                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>

                    );

                })}

            </Row>

        </Container>

    );
}

export default ProductSelectionScreen;
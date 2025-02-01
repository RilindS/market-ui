import React from "react";
import ProductForm from "../../components/product/ProductForm";

const CreateProductPage = () => {
  return (
    <div>
      <h2>Create Product</h2>
      <ProductForm onSuccess={() => window.location.reload()} />
    </div>
  );
};

export default CreateProductPage;

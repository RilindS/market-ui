import React, { useEffect, useState } from "react";
import { getProductById } from "../services/productService";
import ProductForm from "../components/ProductForm";
import { useParams } from "react-router-dom";

const UpdateProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }
    fetchProduct();
  }, [id]);

  return (
    <div>
      <h2>Update Product</h2>
      {product ? <ProductForm initialData={product} isEditMode={true} onSuccess={() => window.location.reload()} /> : <p>Loading...</p>}
    </div>
  );
};

export default UpdateProductPage;

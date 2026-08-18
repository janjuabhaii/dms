import axiosInstance from "./axiosInstance";

/**
 * Builds FormData for create/update since both send an image file alongside
 * regular fields. `Content-Type: undefined` in the request config is
 * deliberate: our shared axios instance defaults to
 * "application/json" globally, and if that header is left in place for a
 * FormData body, the browser never gets to set the multipart boundary
 * itself, and the backend fails to parse the request. Unsetting it here
 * lets axios/the browser generate the correct header automatically.
 */
const toFormData = ({ name, price, description, stock, imageFile }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("description", description || "");
  formData.append("stock", stock);
  if (imageFile) formData.append("image", imageFile);
  return formData;
};

export const productApi = {
  getAll: (search = "") =>
    axiosInstance.get("/products", { params: search ? { search } : {} }),

  getById: (id) => axiosInstance.get(`/products/${id}`),

  create: (product) =>
    axiosInstance.post("/products", toFormData(product), {
      headers: { "Content-Type": undefined },
    }),

  update: (id, product) =>
    axiosInstance.put(`/products/${id}`, toFormData(product), {
      headers: { "Content-Type": undefined },
    }),

  remove: (id) => axiosInstance.delete(`/products/${id}`),
};

import { Modal, Form, Input } from "antd";
import { useState } from "react";
import { addcustomerservice } from "../services/customerservices";
import { toast } from "react-toastify";
import { handleError } from "../utils/handleError";

const PosAddcustomer = ({
  visible,
  onCancel,
  fetchCustomers,
}: {
  visible: boolean;
  onCancel: () => void;
  fetchCustomers?: () => void;
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      for (const [key, value] of Object.entries(values)) {
        if (!value || value.toString().trim() === "") {
          const formattedKey = key
            .replace("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
          setLoading(false);
          toast.error(`Please fill ${formattedKey}`);
          return;
        }
      }
      const formData = new FormData();
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);

      await addcustomerservice(formData);
      toast.success("Customer added successfully");
      form.resetFields();
      onCancel();
      fetchCustomers?.();
    } catch (err) {
      console.error("Error adding customer:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add Customer"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" name="add_customer">
        <Form.Item label="First Name" name="first_name">
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item label="Last Name" name="last_name">
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email", message: "Enter a valid email!" }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ min: 7, message: "Phone number too short!" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PosAddcustomer;

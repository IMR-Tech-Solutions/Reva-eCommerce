import {  useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonLoading from "../../components/common/ButtonLoading";
import Label from "../../components/form/Label";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { addvendorservice } from "../../services/vendorservices";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { all_routes } from "../../Router/allroutes";

const AddVendor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [vendorData, setVendorData] = useState({
    is_self: false,
    vendor_name: "",
    contact_person: "",
    contact_number: "",
    email: "",
    gst_number: "",
    pan_number: "",
    registration_number: "",
    address: "",
    state: "",
    city: "",
    postal_code: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    is_active: true,
  });

  const hasManualData = () => {
    const manualFields = [
      "vendor_name",
      "contact_person",
      "contact_number",
      "email",
      "gst_number",
      "pan_number",
      "registration_number",
      "address",
      "state",
      "city",
      "postal_code",
      "bank_name",
      "account_number",
      "ifsc_code",
      "upi_id",
    ];

    return manualFields.some(
      (field) => vendorData[field as keyof typeof vendorData] !== ""
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      if (name === "is_self" && checked) {
        setVendorData((prev) => ({
          ...prev,
          [name]: checked,
          vendor_name: "",
          contact_person: "",
          contact_number: "",
          email: "",
          gst_number: "",
          pan_number: "",
          registration_number: "",
          address: "",
          state: "",
          city: "",
          postal_code: "",
          bank_name: "",
          account_number: "",
          ifsc_code: "",
          upi_id: "",
        }));
      } else {
        setVendorData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setVendorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();

    if (vendorData.is_self) {
      formData.append("is_self", "true");
    } else {
      const requiredFields = [
        "vendor_name",
        "contact_person",
        "contact_number",
        "email",
      ];

      for (const field of requiredFields) {
        if (!vendorData[field as keyof typeof vendorData]) {
          toast.error(`${field.replace("_", " ")} is required.`);
          setIsLoading(false);
          return;
        }
      }

      for (const key in vendorData) {
        const value = (vendorData as any)[key];
        formData.append(
          key,
          typeof value === "boolean" ? value.toString() : value
        );
      }
    }

    try {
      await addvendorservice(formData);
      toast.success("Vendor added successfully!");

      setVendorData({
        is_self: false,
        vendor_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        gst_number: "",
        pan_number: "",
        registration_number: "",
        address: "",
        state: "",
        city: "",
        postal_code: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
        is_active: true,
      });
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Add Vendor"
        description="Add a new vendor to Inventa System"
      />
      <PageBreadcrumb pageTitle="Add New Vendor" />
      <ButtonComponentCard
        title="Vendor Information"
        buttonlink={all_routes.vendors}
        buttontitle="View All Vendors"
      >
        <form onSubmit={handleSubmit}>
          {/* Self Vendor Checkbox */}
          <div className="mb-5">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_self"
                name="is_self"
                checked={vendorData.is_self}
                onChange={handleChange}
                disabled={hasManualData()}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Label htmlFor="is_self" className="mb-0">
                Self Vendor (Use my profile information)
              </Label>
            </div>
            {hasManualData() && (
              <p className="text-xs text-orange-500 mt-1">
                Clear manual fields to enable self vendor option
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            <div>
              <Label>Vendor Name</Label>
              <input
                type="text"
                name="vendor_name"
                value={vendorData.vendor_name}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100  disabled:cursor-not-allowed"
                maxLength={150}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter vendor name"
                }
              />
            </div>
            <div>
              <Label>Contact Person</Label>
              <input
                type="text"
                name="contact_person"
                value={vendorData.contact_person}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={150}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter contact person name"
                }
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <input
                type="text"
                name="contact_number"
                value={vendorData.contact_number}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={15}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter contact number"
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <input
                type="email"
                name="email"
                value={vendorData.email}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter email address"
                }
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            <div>
              <Label>GST Number</Label>
              <input
                type="text"
                name="gst_number"
                value={vendorData.gst_number}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={15}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter GST number"
                }
              />
            </div>
            <div>
              <Label>PAN Number</Label>
              <input
                type="text"
                name="pan_number"
                value={vendorData.pan_number}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={10}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter PAN number"
                }
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div>
              <Label>Registration Number</Label>
              <input
                type="text"
                name="registration_number"
                value={vendorData.registration_number}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={50}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter registration number"
                }
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-5">
            <Label>Address</Label>
            <textarea
              name="address"
              value={vendorData.address}
              onChange={handleChange}
              disabled={vendorData.is_self}
              className="input-field min-h-[80px] resize-vertical dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={
                vendorData.is_self
                  ? "Auto-filled from profile"
                  : "Enter complete address"
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
            <div>
              <Label>State</Label>
              <input
                type="text"
                name="state"
                value={vendorData.state}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={100}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter state"
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <input
                type="text"
                name="city"
                value={vendorData.city}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={100}
                placeholder={
                  vendorData.is_self ? "Auto-filled from profile" : "Enter city"
                }
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <input
                type="text"
                name="postal_code"
                value={vendorData.postal_code}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={10}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter postal code"
                }
              />
            </div>
          </div>

          {/* Banking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            <div>
              <Label>Bank Name</Label>
              <input
                type="text"
                name="bank_name"
                value={vendorData.bank_name}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={100}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter bank name"
                }
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <input
                type="text"
                name="account_number"
                value={vendorData.account_number}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={30}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter account number"
                }
              />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <input
                type="text"
                name="ifsc_code"
                value={vendorData.ifsc_code}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={15}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter IFSC code"
                }
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div>
              <Label>UPI ID</Label>
              <input
                type="text"
                name="upi_id"
                value={vendorData.upi_id}
                onChange={handleChange}
                disabled={vendorData.is_self}
                className="input-field dark:disabled:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={100}
                placeholder={
                  vendorData.is_self
                    ? "Auto-filled from profile"
                    : "Enter UPI ID"
                }
              />
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={vendorData.is_active}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_active" className="mb-0">
                Vendor is Active
              </Label>
            </div>
          </div>

          {vendorData.is_self && (
            <div className="mb-5 p-4 bg-gray-300 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Self vendor option selected. All fields
                will be automatically filled with your profile information when
                the vendor is created.
              </p>
            </div>
          )}

          <ButtonLoading
            loading={isLoading}
            state="Add Vendor"
            loadingstate="Adding Vendor..."
            className="w-fit mt-8"
          />
        </form>
      </ButtonComponentCard>
    </>
  );
};

export default AddVendor;

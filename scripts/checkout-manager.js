// scripts/checkout-manager.js
import { Cart } from '../scripts/modules/cart.js';

export class CheckoutManager {
    constructor(loader = null) {
        // Use existing cart instance if available
        this.cart = window.globalCart || new Cart();
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.checkoutData = null;
        this.customerDetailsUpdated = false;
        this.basketData = null; // Store basket data
        this.shippingRatesData = null; // Store shipping rates
        
        // Initialize loader if not provided
        if (!loader) {
          try {
            const Loader = require('../components/loader/loader.js').default;
            this.loader = new Loader();
          } catch (e) {
            console.warn("Loader module not available:", e);
            this.loader = {
              show: () => {},
              hide: () => {},
              showFor: (ms) => new Promise(resolve => setTimeout(resolve, ms))
            };
          }
        } else {
          this.loader = loader;
        }
        
        // Checkout-specific loading messages
        this.loader.customMessages = [
          "Securing your payment details...",
          "Preparing your order summary...",
          "Checking shipping options...",
          "Verifying your cart items...",
          "Setting up a secure checkout...",
          "Almost ready for your order...",
          "Calculating final totals..."
        ];
      }
      async init() {
        try {
          this.loader.show("Initializing checkout...");
          
          // Initialize cart only if not already initialized
          if (!this.cart.initialized) {
            await this.cart.init();
          }
          
          // Fetch checkout data only once
          await this.fetchCheckoutData();
          
          // Populate customer and address fields with data from checkout response
          this.populateCustomerFields();
          this.populateAddressFields();
          
          // Initialize Stripe with the fetched data
          await this.initializeStripe();
          
          this.setupCardValidation();
          this.bindEvents();
          this.setupCustomerDetailsListeners();
          this.setupAddressFieldsListeners();
          
          // Use the already fetched checkout data for order summary
          this.updateOrderSummaryFromData();
          
          this.loader.hide();
        } catch (error) {
          console.error("CheckoutManager: Initialization failed:", error);
          this.showError("Failed to initialize checkout. Please try again.");
          this.loader.hide();
        }
      }
      
      

      setupAddressFieldsListeners() {
        const addressFields = ["address1", "address2", "city", "county", "postcode", "country"];
        
        addressFields.forEach((field) => {
          const element = document.getElementById(field);
          if (element) {
            element.addEventListener("blur", async () => {
              if (this.validateAddressFields()) {
                await this.updateCustomerAndAddress();
              }
            });
          }
        });
      }

      validateAddressFields() {
        const address1 = document.getElementById("address1").value.trim();
        const city = document.getElementById("city").value.trim();
        const county = document.getElementById("county").value.trim();
        const postcode = document.getElementById("postcode").value.trim();
        const country = document.getElementById("country").value.trim();
      
        // Return true only if required address fields are valid
        return address1 && city && county && postcode && country;
      }
      async updateCustomerAndAddress() {
        console.log("CheckoutManager: Updating customer details and address");
        
        try {
          // Get current customer details
          const customerName = document.getElementById("name").value.trim();
          const customerEmail = document.getElementById("email").value.trim();
          const customerPhone = document.getElementById("phone").value.trim();
          
          // Get current address details
          const address1 = document.getElementById("address1").value.trim();
          const address2 = document.getElementById("address2").value.trim() || "";
          const city = document.getElementById("city").value.trim();
          const county = document.getElementById("county").value.trim();
          const postcode = document.getElementById("postcode").value.trim();
          const country = document.getElementById("country").value.trim();
          
          console.log("CheckoutManager: Updating with customer and address details:", {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: {
              address_line_1: address1,
              address_line_2: address2,
              city: city,
              state: county,
              postcode: postcode,
              country: country
            }
          });
          
          const formData = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            address: {
              address_line_1: address1,
              address_line_2: address2,
              city: city,
              state: county,
              postcode: postcode,
              country: country
            }
          };
          
          const response = await axiosServices.post("/commerce/basket/update", formData);
          
          if (!response.status) {
            throw new Error(response.data.message || "Failed to update customer and address");
          }
          
          // Update local basket data
          this.basketData = await this.fetchBasketData();
          
          return response.status;
        } catch (error) {
          console.error("CheckoutManager: Customer and address update failed:", error);
          return false;
        }
      }
            
      
      populateCustomerFields() {
        console.log("CheckoutManager: Populating customer fields from checkout data");
        
        if (this.checkoutData?.basket) {
          const basket = this.checkoutData.basket;
          
          // Get the form field elements
          const nameField = document.getElementById("name");
          const emailField = document.getElementById("email");
          const phoneField = document.getElementById("phone");
          
          // Populate fields if they exist and are empty
          if (nameField && !nameField.value && basket.customer_name) {
            nameField.value = basket.customer_name;
          }
          
          if (emailField && !emailField.value && basket.customer_email) {
            emailField.value = basket.customer_email;
          }
          
          if (phoneField && !phoneField.value && basket.customer_phone) {
            phoneField.value = basket.customer_phone;
          }
          
          console.log("CheckoutManager: Customer fields populated successfully");
        } else {
          console.log("CheckoutManager: No basket data available to populate customer fields");
        }
      }
      

       populateCustomerFields() {
        
        if (this.checkoutData?.basket) {
          const basket = this.checkoutData.basket;
          
          // Get the form field elements
          const nameField = document.getElementById("name");
          const emailField = document.getElementById("email");
          const phoneField = document.getElementById("phone");
          
          // Populate fields if they exist and are empty
          if (nameField && !nameField.value && basket.customer_name) {
            nameField.value = basket.customer_name;
          }
          
          if (emailField && !emailField.value && basket.customer_email) {
            emailField.value = basket.customer_email;
          }
          
          if (phoneField && !phoneField.value && basket.customer_phone) {
            phoneField.value = basket.customer_phone;
          }
          
        } else {
          console.log("CheckoutManager: No basket data available to populate customer fields");
        }
      }
    
      async fetchBasketData() {
        try {
            console.log("CheckoutManager: Fetching basket data");
            
            // Use cached basket response if available
            if (Cart.basketResponse) {
                console.log("CheckoutManager: Using cached basket data");
                return Cart.basketResponse.data.basket;
            }
            
            // If no cached response, use the cart instance's data if available
            if (this.cart.items.size > 0) {
                console.log("CheckoutManager: Using cart instance data");
                return {
                    items: Array.from(this.cart.items.values()),
                    sub_total: this.cart.subtotal,
                    total: this.cart.total,
                    shipping_charges: this.cart.shippingCharges,
                    shipping_rate_id: this.cart.selectedShippingRate?.shipping_rate__id
                };
            }
            
            // As a last resort, fetch new data
            console.log("CheckoutManager: Fetching new basket data");
            const response = await axiosServices.get("/commerce/basket");
            Cart.basketResponse = response; // Cache the response
            
            if (response.status && response.data.basket) {
                return response.data.basket;
            }
            return null;
        } catch (error) {
            console.error("CheckoutManager: Failed to fetch basket data:", error);
            return null;
        }
    }
    
    
    async fetchCheckoutData() {
        // Fetch checkout data only once
        if (!this.checkoutData) {
          const response = await axiosServices.get("/commerce/checkout");
          this.checkoutData = response.data;
          return this.checkoutData;
          
        }
        return this.checkoutData;
      }

    setupCustomerDetailsListeners() {
        const customerFields = ["name", "email", "phone"];
        
        customerFields.forEach((field) => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener("blur", async () => {
                    if (this.validateCustomerDetails()) {
                        await this.updateCustomerDetails();
                    }
                });
            }
        });
    }

    async updateFullBasket() {
        console.log("CheckoutManager: Updating full basket details");
        try {
          // Get current customer details
          const customerName = document.getElementById("name").value.trim();
          const customerEmail = document.getElementById("email").value.trim();
          const customerPhone = document.getElementById("phone").value.trim();
          
          console.log("CheckoutManager: Updating basket with full details including customer:", {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          });
          
          const formData = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            address: {
              address_line_1: document.getElementById("address1").value,
              address_line_2: document.getElementById("address2").value || "",
              city: document.getElementById("city").value,
              state: document.getElementById("county").value,
              postcode: document.getElementById("postcode").value,
              country: document.getElementById("country").value,
            }
          };
      
          const response = await axiosServices.post("/commerce/basket/update", formData);
          
          if (!response.status) {
            throw new Error(response.data.message || "Failed to update basket");
          }
          
          // Update local basket data
          this.basketData = await this.fetchBasketData();
      
          return response.status;
        } catch (error) {
          console.error("CheckoutManager: Full basket update failed:", error);
          return false;
        }
      }
      
      
    setupCardValidation() {
        if (this.cardElement) {
            this.cardElement.on("change", ({ error }) => {
                const displayError = document.getElementById("card-errors");
                if (error) {
                    displayError.textContent = error.message;
                    displayError.classList.remove("d-none");
                } else {
                    displayError.textContent = "";
                    displayError.classList.add("d-none");
                }
            });
        }
    }
    
    updateOrderSummaryFromData() {
        if (this.checkoutData?.amount) {
          const totalElement = document.getElementById("total-amount");
          if (totalElement) {
            totalElement.textContent = `£${(this.checkoutData.amount).toFixed(2)}`;
          }
        }
      }
    
    showError(message) {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        } else {
            // Fallback to alert if element not found
            alert(message);
        }
    }

    async validateBasket() {
        try {
            // Use cart's basket data if available
            if (this.cart.items.size > 0) {
                return true;
            }
            
            // Use cached basket response if available
            if (Cart.basketResponse && Cart.basketResponse.data?.basket?.items?.length) {
                return true;
            }
            
            // Otherwise fetch basket data
            const response = await axiosServices.get("/commerce/basket");
            Cart.basketResponse = response; // Cache the response
            
            if (!response.data?.basket?.items?.length) {
                window.location.href = "/index.html";
                return false;
            }
    
            return true;
        } catch (error) {
            console.error("CheckoutManager: Failed to validate basket:", error);
            return false;
        }
    }
    

    async initializeStripe() {
        try {
          this.loader.show("Setting up secure payment...");
          
          // First validate if basket is valid - use cached data if available
          const isValidBasket = await this.validateBasket();
          if (!isValidBasket) {
            return;
          }
      
          // Use the already fetched checkout data
          const data = this.checkoutData;
      
          if (!data?.client_secret || !data?.publishable_key) {
            throw new Error("Missing Stripe configuration data");
          }
      
          this.clientSecret = data.client_secret;
      
          // Initialize Stripe with the account ID if available
          const stripeOptions = data.account_id ? 
            { stripeAccount: data.account_id } : {};
          
          this.stripe = Stripe(data.publishable_key, stripeOptions);
          this.elements = this.stripe.elements();
      
          const style = {
            base: {
              fontSize: '16px',
              color: '#32325d',
              fontFamily: '"Roboto", sans-serif',
              fontSmoothing: 'antialiased',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#e74c3c',
              iconColor: '#e74c3c'
            }
          };
      
          // Unmount existing card element if it exists
          if (this.cardElement) {
            this.cardElement.unmount();
          }
      
          this.cardElement = this.elements.create("card", { style });
          const mountPoint = document.getElementById("card-element");
      
          if (!mountPoint) {
            throw new Error("Card element mount point not found");
          }
      
          this.cardElement.mount("#card-element");
          this.setupCardValidation();
          
        } catch (error) {
          console.error("CheckoutManager: Stripe initialization failed:", error);
          this.showError("Failed to initialize payment system. Please try again later.");
        }
      }

    validateCustomerDetails() {
        console.log("CheckoutManager: Validating customer details");
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
    
        // Silent validation without alerts
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s+()-]{10,}$/;
    
        // Return true only if all fields are valid
        return name && emailRegex.test(email) && phoneRegex.test(phone);
    }
    
    async updateCustomerDetails() {
        console.log("CheckoutManager: Updating customer details");
        if (!this.validateCustomerDetails()) return false;
    
        try {
            const customerData = {
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim()
            };
    
            const response = await axiosServices.post("/commerce/basket/update", {customer: customerData});
            this.customerDetailsUpdated = response.status;
            
            // Update local basket data
            if (response.status) {
                this.basketData = await this.fetchBasketData();
            }
            
            return response.status;
        } catch (error) {
            console.error("CheckoutManager: Customer details update failed:", error);
            return false;
        }
    }
    populateAddressFields() {
        
        if (this.checkoutData?.basket) {
          const basket = this.checkoutData.basket;
          
          // Only proceed if basket has address data
          if (basket.address) {
            // Get the form field elements
            const address1Field = document.getElementById("address1");
            const address2Field = document.getElementById("address2");
            const cityField = document.getElementById("city");
            const countyField = document.getElementById("county");
            const postcodeField = document.getElementById("postcode");
            const countryField = document.getElementById("country");
            
            // Populate fields if they exist and are empty
            if (address1Field && !address1Field.value && basket.address.address_line_1) {
              address1Field.value = basket.address.address_line_1;
            }
            
            if (address2Field && !address2Field.value && basket.address.address_line_2) {
              address2Field.value = basket.address.address_line_2;
            }
            
            if (cityField && !cityField.value && basket.address.city) {
              cityField.value = basket.address.city;
            }
            
            if (countyField && !countyField.value && basket.address.state) {
              countyField.value = basket.address.state;
            }
            
            if (postcodeField && !postcodeField.value && basket.address.postcode) {
              postcodeField.value = basket.address.postcode;
            }
            
            if (countryField && !countryField.value && basket.address.country) {
              countryField.value = basket.address.country;
            }
            
          } else {
          }
        } else {
          console.log("CheckoutManager: No basket data available to populate address fields");
        }
      }
      
    bindEvents() {
        const submitButton = document.getElementById("place-order-btn");
        if (!submitButton) return;
        
        submitButton.addEventListener("click", async (e) => {
            e.preventDefault();
            
            console.log("CheckoutManager: Place order button clicked");
    
            // Check if terms and conditions are accepted
            if (!document.getElementById("privacy").checked) {
                alert("Please accept the terms and conditions");
                return;
            }
    
            if (!this.validateFullForm()) return;
    
            // Disable button to prevent multiple submissions
            submitButton.disabled = true;
    
            try {
                await this.processOrder();
            } catch (error) {
                console.error("CheckoutManager: Order processing failed:", error);
            } finally {
                // Re-enable button if there was an error
                submitButton.disabled = false;
            }
        });
    }
    
    validateFullForm() {
        const required = ["name", "email", "phone", "postcode", "address1", "city", "county"];
        let isValid = true;

        required.forEach((field) => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                isValid = false;
                if (element) {
                    element.classList.add("is-invalid");
                }
            } else {
                element.classList.remove("is-invalid");
            }
        });

        // Show validation messages only during final form submission
        if (!isValid) {
            this.showToast("Please fill in all required fields", "error");
        } else if (!this.validateCustomerDetails()) {
            this.showToast("Please check your contact details", "error");
            isValid = false;
        }

        return isValid;
    }
    
    async handleOrderSuccess() {
        try {
            // Redirect to order confirmation page
            window.location.href = "/pages/order-confirmation/order-confirmation.html";
        } catch (error) {
            console.error("Error handling order success:", error);
            throw error;
        }
    }

    async processOrder() {
        try {
            if (!this.validateFullForm()) {
                return false;
            }

            this.loader.show("Processing your payment...");

            // Update full basket first
            const basketUpdated = await this.updateFullBasket();
            if (!basketUpdated) {
                throw new Error("Failed to update basket with full details");
            }

            // Ensure card element is mounted and valid
            if (!this.cardElement) {
                throw new Error("Card element not initialized");
            }

            // Create payment method first
            const { paymentMethod, error: paymentMethodError } = await this.stripe.createPaymentMethod({
                type: "card",
                card: this.cardElement,
                billing_details: this.getBillingDetails()
            });

            if (paymentMethodError) {
                throw paymentMethodError;
            }

            // Then confirm payment using client secret
            this.loader.show("Confirming your payment...");
            const { error } = await this.stripe.confirmCardPayment(this.clientSecret, {
                payment_method: paymentMethod.id
            });

            if (error) {
                throw error;
            }

            console.log("CheckoutManager: Payment successful");
            this.loader.show("Payment successful! Redirecting...");
            await this.handleOrderSuccess();

        } catch (error) {
            console.error("CheckoutManager: Payment failed:", error);
            
            // Show user-friendly error message
            const errorElement = document.getElementById("card-errors");
            if (errorElement) {
                errorElement.textContent = error.message || "An error occurred during payment";
                errorElement.classList.remove("d-none");
            }
            
            this.loader.hide();
            throw error;
        }
    }

    async createPaymentMethod() {
        const { paymentMethod, error } = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.cardElement,
            billing_details: this.getBillingDetails()
        });

        if (error) {
            throw error;
        }

        return paymentMethod.id;
    }
    
    getBillingDetails() {
        return {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: {
                line1: document.getElementById("address1").value,
                line2: document.getElementById("address2").value || "",
                city: document.getElementById("city").value,
                state: document.getElementById("county").value,
                postal_code: document.getElementById("postcode").value,
                country: document.getElementById("country").value
            }
        };
    }

    showToast(message, type) {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.checkoutManager = new CheckoutManager();
});

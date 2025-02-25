import { Cart } from '../scripts/modules/cart.js';
import axiosServices from '../scripts/services/axiosService.js';


export class CheckoutManager {
    constructor() {
        this.cart = new Cart();
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.checkoutData = null;
        this.customerDetailsUpdated = false;
        this.init();
    }
    
    async init() {
        try {
            console.log("CheckoutManager: Initializing...");
            await this.cart.init();
            await this.initializeStripe();
            this.setupCardValidation();
            this.bindEvents();
            this.setupCustomerDetailsListeners();
            await this.updateOrderSummary();
        } catch (error) {
            console.error("CheckoutManager: Initialization failed:", error);
            this.showError("Failed to initialize checkout. Please try again.");
        }
    }
    
    

    setupCustomerDetailsListeners() {
        console.log("CheckoutManager: Setting up customer details listeners");
        const customerFields = ["name", "email", "phone"];
        
        customerFields.forEach((field) => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener("blur", async () => {
                    const name = document.getElementById("name").value.trim();
                    const email = document.getElementById("email").value.trim();
                    const phone = document.getElementById("phone").value.trim();
                    
                    // Only proceed if all fields have values
                    if (name && email && phone) {
                        if (this.validateCustomerDetails()) {
                            await this.updateCustomerDetails();
                        }
                    }
                });
            }
        });
    }


    async updateFullBasket() {
        console.log("CheckoutManager: Updating full basket details");
        try {
            const formData = {
                customer_name: document.getElementById("name").value,
                customer_email: document.getElementById("email").value,
                customer_phone: document.getElementById("phone").value,
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
      
            return response.status;
        } catch (error) {
            console.error("CheckoutManager: Full basket update failed:", error);
            return false;
        }
    }
      
      setupCustomerDetailsListeners() {
        console.log("CheckoutManager: Setting up customer details listeners");
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
    
    
    
    async updateOrderSummary() {
        try {
            const response = await axiosServices.get("/commerce/checkout");
            if (response.data?.amount) {
                const totalElement = document.getElementById("total-amount");
                if (totalElement) {
                    totalElement.textContent = `£${(response.data.amount).toFixed(2)}`;
                }
            }
        } catch (error) {
            console.error("CheckoutManager: Failed to update order summary:", error);
        }
    }

    

    
    showError(message) {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
        // Fallback to alert if element not found
        alert(message);
    }


   async validateBasket() {
    try {
        const response = await axiosServices.get("/commerce/basket");
        
        if (!response.data?.basket?.items?.length) {
            window.location.href = "/cart.html";
            return false;
        }

        return true;
    } catch (error) {
        console.error("CheckoutManager: Failed to validate basket:", error);
    }
}

    

async initializeStripe() {
    try {
        // First validate if basket is valid
        const isValidBasket = await this.validateBasket();
        if (!isValidBasket) {
            return;
        }

        const response = await axiosServices.get("/commerce/checkout");
        const data = response.data;

        if (!data?.client_secret || !data?.stripe_publishable_key) {
            throw new Error("Missing Stripe configuration data");
        }

        this.clientSecret = data.client_secret;

        // Initialize Stripe with the account ID if available
        const stripeOptions = data.stripe_account_id ? 
            { stripeAccount: data.stripe_account_id } : {};
        
        this.stripe = Stripe(data.stripe_publishable_key, stripeOptions);
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
        
        console.log("CheckoutManager: Stripe initialized successfully");

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
                customer_name: document.getElementById("name").value.trim(),
                customer_email: document.getElementById("email").value.trim(),
                customer_phone: document.getElementById("phone").value.trim()
            };
    
            const response = await axiosServices.post("/commerce/basket/update", customerData);
            this.customerDetailsUpdated = response.status;
            return response.status;
        } catch (error) {
            console.error("CheckoutManager: Customer details update failed:", error);
            return false;
        }
    }

    bindEvents() {
        const submitButton = document.getElementById("place-order-btn");
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

async processOrder() {
    try {
        if (!this.validateFullForm()) {
            return false;
        }

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
        const { error } = await this.stripe.confirmCardPayment(this.clientSecret, {
            payment_method: paymentMethod.id
        });

        if (error) {
            throw error;
        }

        console.log("CheckoutManager: Payment successful");
        window.location.href = "/order-confirmation";

    } catch (error) {
        console.error("CheckoutManager: Payment failed:", error);
        
        // Show user-friendly error message
        const errorElement = document.getElementById("card-errors");
        if (errorElement) {
            errorElement.textContent = error.message || "An error occurred during payment";
            errorElement.classList.remove("d-none");
        }
        
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
    console.log("CheckoutManager: Initializing on page load");
    window.checkoutManager = new CheckoutManager();
});

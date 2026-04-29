// services/api.ts
const API_URL = "https://alsas.admin.t-carts.com/api";

export interface Category {
  id: number;
  name: string;
  image: string;
  subcategories: any[];
}

export interface Slider {
  id: number;
  sub_title: string;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
}

export interface AdPopup {
  id: number;
  sub_title: string;
  name: string;
  description: string;
  link: string | null;
  image: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ProductPricing {
  price: number;
  has_discount: boolean;
  discount_type: string | null;
  discount_value: number | null;
  price_after_discount: number | null;
  final_price: number;
}

export interface Product {
  id: number;
  type: string;
  is_active: boolean;
  name: string;
  description: string;
  category: Category;
  subcategory: any;
  brand: any;
  has_production_date: boolean;
  pricing: ProductPricing;
  has_variants: boolean;
  variants: any;
  quantity: number;
  images: string[];
}

export interface ProductsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    products: Product[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
      next_page: number | null;
      previous_page: number | null;
    };
  };
}

export interface ApiResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface SliderResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    sliders: Slider[];
  };
}

export interface AdsResponse {
  result: boolean;
  errNum: number;
  message: string;
  data: {
    ad_pop_up: AdPopup[];
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: ApiResponse = await response.json();
    
    if (data.result && data.data.categories) {
      return data.data.categories;
    } else {
      console.error('API Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getSliders(): Promise<Slider[]> {
  try {
    const response = await fetch(`${API_URL}/sliders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: SliderResponse = await response.json();
    
    if (data.result && data.data.sliders) {
      return data.data.sliders.filter(slider => slider.is_active === 1);
    } else {
      console.error('API Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch sliders:', error);
    return [];
  }
}

export async function getNewProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products/new-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: ProductsResponse = await response.json();
    
    if (data.result && data.data.products) {
      return data.data.products.filter(product => product.is_active === true);
    } else {
      console.error('API Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch new products:', error);
    return [];
  }
}

export async function getMostSellingProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products/most-selling-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: ProductsResponse = await response.json();
    
    if (data.result && data.data.products) {
      return data.data.products.filter(product => product.is_active === true);
    } else {
      console.error('API Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch most selling products:', error);
    return [];
  }
}

// دالة لجلب الإعلانات
export async function getAds(): Promise<AdPopup[]> {
  try {
    const response = await fetch(`${API_URL}/ads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: AdsResponse = await response.json();
    
    if (data.result && data.data.ad_pop_up) {
      // فقط الإعلانات النشطة
      return data.data.ad_pop_up.filter(ad => ad.is_active === 1);
    } else {
      console.error('API Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return [];
  }
}
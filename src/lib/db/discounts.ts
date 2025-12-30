import { getSupabaseClient } from "./courses";
import type { Discount, CouponCode, CouponUsage } from "./schema";

// Discount operations
export async function getAllDiscounts(activeOnly = false) {
  const client = getSupabaseClient();
  let query = client.from("discounts").select("*");
  
  if (activeOnly) {
    query = query.eq("active", true);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Discount[];
}

export async function getDiscountById(id: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("discounts")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as Discount;
}

export async function getApplicableDiscounts(
  courseId?: string,
  bundleId?: string,
  cartTotal?: number
) {
  const client = getSupabaseClient();
  const now = new Date().toISOString();
  
  let query = client
    .from("discounts")
    .select("*")
    .eq("active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`);
  
  // Filter by applicable_to
  if (courseId) {
    query = query.or(`applicable_to.eq.all,applicable_to.eq.course,course_id.eq.${courseId}`);
  } else if (bundleId) {
    query = query.or(`applicable_to.eq.all,applicable_to.eq.bundle,bundle_id.eq.${bundleId}`);
  } else {
    query = query.eq("applicable_to", "all");
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Filter by min_purchase_amount if provided
  let discounts = (data || []) as Discount[];
  if (cartTotal !== undefined) {
    discounts = discounts.filter(
      (d) => !d.min_purchase_amount || cartTotal >= d.min_purchase_amount
    );
  }
  
  // Filter by usage_limit
  discounts = discounts.filter(
    (d) => !d.usage_limit || d.usage_count < d.usage_limit
  );
  
  return discounts;
}

export async function createDiscount(discount: Omit<Discount, "id" | "created_at" | "updated_at" | "usage_count">) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("discounts") as any)
    .insert([{ ...discount, usage_count: 0 }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Discount;
}

export async function updateDiscount(id: string, updates: Partial<Discount>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("discounts") as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Discount;
}

export async function incrementDiscountUsage(id: string) {
  const discount = await getDiscountById(id);
  return await updateDiscount(id, { usage_count: discount.usage_count + 1 });
}

export async function deleteDiscount(id: string) {
  const client = getSupabaseClient();
  const { error } = await client
    .from("discounts")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

// Coupon code operations
export async function getAllCouponCodes(activeOnly = false) {
  const client = getSupabaseClient();
  let query = client.from("coupon_codes").select("*");
  
  if (activeOnly) {
    query = query.eq("active", true);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as CouponCode[];
}

export async function getCouponCodeById(id: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("coupon_codes")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as CouponCode;
}

export async function getCouponCodeByCode(code: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("coupon_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  return data as CouponCode | null;
}

export async function validateCouponCode(
  code: string,
  userId?: string,
  courseId?: string,
  bundleId?: string,
  cartTotal?: number
): Promise<{ valid: boolean; coupon?: CouponCode; error?: string }> {
  const coupon = await getCouponCodeByCode(code);
  
  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }
  
  if (!coupon.active) {
    return { valid: false, error: "This coupon is not active" };
  }
  
  const now = new Date();
  
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, error: "This coupon is not yet valid" };
  }
  
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { valid: false, error: "This coupon has expired" };
  }
  
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }
  
  if (userId && coupon.user_limit) {
    const client = getSupabaseClient();
    const { count } = await client
      .from("coupon_usage")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId);
    
    if (count && count >= coupon.user_limit) {
      return { valid: false, error: "You have reached the usage limit for this coupon" };
    }
  }
  
  if (coupon.min_cart_amount && cartTotal !== undefined && cartTotal < coupon.min_cart_amount) {
    return { valid: false, error: `Minimum cart amount of $${coupon.min_cart_amount} required` };
  }
  
  // Check applicable_to
  if (coupon.applicable_to === "course" && !courseId) {
    return { valid: false, error: "This coupon is only valid for specific courses" };
  }
  
  if (coupon.applicable_to === "bundle" && !bundleId) {
    return { valid: false, error: "This coupon is only valid for bundles" };
  }
  
  if (courseId && coupon.course_id && coupon.course_id !== courseId) {
    return { valid: false, error: "This coupon is not valid for this course" };
  }
  
  if (bundleId && coupon.bundle_id && coupon.bundle_id !== bundleId) {
    return { valid: false, error: "This coupon is not valid for this bundle" };
  }
  
  return { valid: true, coupon };
}

export async function applyCouponCode(
  code: string,
  cartTotal: number,
  items: Array<{ type: "course" | "bundle"; id: string; price: number }>
): Promise<{ discount: number; coupon: CouponCode } | null> {
  // For cart-level coupons, we need to check if any item matches
  let applicable = false;
  let courseId: string | undefined;
  let bundleId: string | undefined;
  
  for (const item of items) {
    if (item.type === "course") {
      courseId = item.id;
    } else {
      bundleId = item.id;
    }
  }
  
  const validation = await validateCouponCode(code, undefined, courseId, bundleId, cartTotal);
  
  if (!validation.valid || !validation.coupon) {
    return null;
  }
  
  const coupon = validation.coupon;
  let discount = 0;
  
  if (coupon.discount_type === "percentage") {
    discount = (cartTotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = coupon.discount_value;
  }
  
  return { discount, coupon };
}

export async function createCouponCode(coupon: Omit<CouponCode, "id" | "created_at" | "updated_at" | "usage_count">) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("coupon_codes") as any)
    .insert([{ ...coupon, code: coupon.code.toUpperCase(), usage_count: 0 }])
    .select()
    .single();
  
  if (error) throw error;
  return data as CouponCode;
}

export async function updateCouponCode(id: string, updates: Partial<CouponCode>) {
  const client = getSupabaseClient();
  const updateData: any = { ...updates, updated_at: new Date().toISOString() };
  if (updates.code) {
    updateData.code = updates.code.toUpperCase();
  }
  
  const { data, error } = await (client.from("coupon_codes") as any)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as CouponCode;
}

export async function recordCouponUsage(
  couponId: string,
  userId: string,
  orderId: string,
  discountAmount: number
) {
  const client = getSupabaseClient();
  
  // Record usage
  const { data: usage, error: usageError } = await (client.from("coupon_usage") as any)
    .insert([{
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
    }])
    .select()
    .single();
  
  if (usageError) throw usageError;
  
  // Increment usage count
  const coupon = await getCouponCodeById(couponId);
  await updateCouponCode(couponId, { usage_count: coupon.usage_count + 1 });
  
  return usage as CouponUsage;
}


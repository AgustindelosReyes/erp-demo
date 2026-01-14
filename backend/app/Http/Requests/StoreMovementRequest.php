<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMovementRequest extends FormRequest
{
    public function rules()
    {
        return [
            'movement_type' => 'required|in:venta,entrada,ajuste',
            'items' => 'required_if:movement_type,venta|required_if:movement_type,entrada|array|min:1',
            'items.*.product_id' => 'required_if:movement_type,venta|required_if:movement_type,entrada|integer|exists:products,id',
            'items.*.quantity' => 'required_if:movement_type,venta|required_if:movement_type,entrada|integer|min:1',
            'items.*.price' => 'required_if:movement_type,venta|required_if:movement_type,entrada|numeric|min:0',
            'product_id' => 'required_if:movement_type,ajuste|integer|exists:products,id',
            'adjusted_stock' => 'required_if:movement_type,ajuste|integer|min:0',
        ];
    }
}
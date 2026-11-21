import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Event', 'Other'];const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];const INITIAL_FORM = {name: '',email: '',phone: '',company: '',source: 'Website',status: 'New',};export default function LeadFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }) {const [form, setForm] = useState(INITIAL_FORM);const [errors, setErrors] = useState({});const [serverError, setServerError] = useState('');useEffect(() => {if (isOpen) {setForm(initialData? {name: initialData.name || '',email: initialData.email || '',phone: initialData.phone || '',company: initialData.company || '',source: initialData.source || 'Website',status: initialData.status || 'New',}: INITIAL_FORM);setErrors({});setServerError('');}}, [isOpen, initialData]);if (!isOpen) return null;const validate = () => {const nextErrors = {};if (!form.name.trim() || form.name.trim().length < 2) {nextErrors.name = 'Name must be at least 2 characters.';}if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
nextErrors.email = 'Please enter a valid email address.';
}
if (
!form.phone.trim() ||
!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/.test(form.phone.trim())) {nextErrors.phone = 'Enter a valid phone number (7–20 digits).';}if (!form.company.trim()) {nextErrors.company = 'Company name is required.';}if (!SOURCES.includes(form.source)) {nextErrors.source = 'Please select a valid source.';}if (!STATUSES.includes(form.status)) {nextErrors.status = 'Please select a valid status.';}setErrors(nextErrors);return Object.keys(nextErrors).length === 0;};const handleChange = (e) => {const { name, value } = e.target;setForm((prev) => ({ ...prev, [name]: value }));if (errors[name]) {setErrors((prev) => ({ ...prev, [name]: '' }));}};const handleSubmit = async (e) => {e.preventDefault();setServerError('');if (!validate()) return;try {
  await onSubmit({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    source: form.source,
    status: form.status,
  });
} catch (err) {
  if (err.errors && err.errors.length > 0) {
    const mapped = {};
    err.errors.forEach((item) => {
      mapped[item.field] = item.message;
    });
    setErrors(mapped);
  } else {
    setServerError(err.message || 'Failed to save lead.')
import React, { useState, useEffect } from 'react'

import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, Modal, Radio, Skeleton, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

import { CButton } from '@coreui/react'

import classEvalCriteriaApi from '~/api/classEvalCriteriaApi'

import ErrorMsg from '~/components/Common/ErrorMsg'
import AdminHeader from '~/components/AdminDashboard/AdminHeader'
import AdminSidebar from '~/components/AdminDashboard/AdminSidebar'
import AdminFooter from '~/components/AdminDashboard/AdminFooter'

const ClassEvalCriteriaDetail = () => {
  const { id } = useParams()

  const [defaultDetail, setDefaulDetail] = useState({})
  const [detail, setDetail] = useState({
    criteriaName: '',
    assignment: {
      title: '',
    },
    expectedWork: 0,
    description: '',
    evalWeight: 0,
    isTeamEval: 0,
    isWorkEval: 0,
    status: 0,
    milestone: '',
  })

  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = 'LMS - Class Eval Criteria Detail'
    window.scrollTo(0, 0)
  }, [])

  const loadData = async () => {
    setLoading(true)
    await classEvalCriteriaApi
      .getDetail(id)
      .then((response) => {
        console.log(response)
        setDefaulDetail(response)
        setDetail((prev) => ({
          ...prev,
          ...response,
          evalWeight: Number(response.evalWeight),
          status: response.status === 'Active' ? 1 : 0,
        }))
      })
      .catch((error) => {
        setError('Something went wrong, please try again')
      })
      .finally(() => setLoading(false))
  }

  const handleEdit = () => {
    setIsEditMode(true)
    setError('')
  }
  const handleSave = async () => {
    if (detail.criteriaName.trim() === '') {
      setError('Eval criteria name must not empty')
      return
    }
    if (!detail.evalWeight) {
      setError('Evaluation weight must not empty')
      return
    }
    if (detail.evalWeight < 0 || detail.evalWeight > 100) {
      setError('Evaluation weight must between 0 and 100')
      return
    }
    if (!detail.expectedWork) {
      setError('Expected Work must not empty')
      return
    }
    if (detail.expectedWork < 0) {
      setError('Expected Work must be positive')
      return
    }
    if (detail.description.trim() === '') {
      setError('Description must not empty')
      return
    }

    const params = {
      criteriaName: detail.criteriaName.trim(),
      evalWeight: detail.evalWeight + '%',
      expectedWork: detail.expectedWork,
      isTeamEval: detail.isTeamEval,
      isWorkEval: detail.isWorkEval,
      status: detail.status,
      description: detail.description,
    }

    await classEvalCriteriaApi
      .changeDetail(id, params)
      .then((response) => {
        setError('You have successfully change your class eval criteria detail')
        setIsEditMode(false)
      })
      .catch((error) => {
        if (error.response.data.message === 'Assignment of this eval already got eval is work eval') {
          setError('One assignment only have one evaluation is work evaluated')
          return
        }
        setError('Something went wrong, please try again')
      })
  }
  const handleCancel = () => {
    setDetail((prev) => ({
      ...prev,
      ...defaultDetail,
      evalWeight: Number(defaultDetail.evalWeight),
      status: defaultDetail.status === 'Active' ? 1 : 0,
    }))
    setIsEditMode(false)
  }

  const modalConfirm = () => {
    setError('')
    Modal.confirm({
      title: `Are you want to save new Eval Criteria Detail?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'OK',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        handleSave()
      },
      onCancel() {},
    })
  }

  return (
    <div>
      <AdminSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AdminHeader />
        <div className="body flex-grow-1 px-3">
          <div className="col-lg-12 ">
            <div className="row">
              <div className="col-lg-12 m-b30">
                <div className="row">
                  <div className="col-12 d-flex align-items-center">
                    <Breadcrumb>
                      <Breadcrumb.Item>
                        <Link to="/dashboard">Dashboard</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Link to="/class-criteria-list">Class Eval Criteria List</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>Class Eval Criteria Detail</Breadcrumb.Item>
                    </Breadcrumb>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 d-flex ">
            <div className="col-lg-12 m-b30">
              <div className="widget-box">
                <div className="widget-inner">
                  <Skeleton loading={loading}>
                    <div className="row">
                      <div className="form-group col-6">
                        <div>
                          <label className="col-form-label">Subject</label>
                          <input className="form-control" type="text" value={detail.subjectName} disabled />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <div>
                          <label className="col-form-label">Milestone</label>
                          <input
                            className="form-control"
                            type="text"
                            value={detail.milestone.milestoneTitle}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label className="col-form-label">Assignment</label>
                        <input className="form-control" type="text" value={detail.assignment.title} disabled />
                      </div>
                      <div className="form-group col-6">
                        <label className="col-form-label">
                          Eval Criteria Name <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <input
                            className="form-control"
                            type="text"
                            value={detail.criteriaName}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, criteriaName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label className="col-form-label">
                          Evaluation Weight (%) <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <input
                            className="form-control"
                            type="number"
                            value={detail.evalWeight}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, evalWeight: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label className="col-form-label">
                          Expected Work <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <input
                            className="form-control"
                            type="number"
                            value={detail.expectedWork}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, expectedWork: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <label className="col-form-label">
                          Status <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <Radio.Group
                            value={detail.status}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, status: e.target.value }))}
                          >
                            <Radio value={1}>Active</Radio>
                            <Radio value={0}>Inactive</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <label className="col-form-label">
                          Team Evaluation? <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <Radio.Group
                            value={detail.isTeamEval}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, isTeamEval: e.target.value }))}
                          >
                            <Radio value={1}>Yes</Radio>
                            <Radio value={0}>No</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <label className="col-form-label">
                          Work Evaluation? <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <Radio.Group
                            value={detail.isWorkEval}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, isWorkEval: e.target.value }))}
                          >
                            <Radio value={1}>Yes</Radio>
                            <Radio value={0}>No</Radio>
                          </Radio.Group>
                        </div>
                      </div>

                      <div className="form-group col-12">
                        <label className="col-form-label">
                          Description <Typography.Text type="danger">*</Typography.Text>
                        </label>
                        <div>
                          <textarea
                            name="message"
                            rows="4"
                            className="form-control"
                            required
                            value={detail.description}
                            disabled={!isEditMode}
                            onChange={(e) => setDetail((prev) => ({ ...prev, description: e.target.value }))}
                          ></textarea>
                        </div>
                      </div>
                      <ErrorMsg
                        errorMsg={error}
                        isError={
                          error === 'You have successfully change your class eval criteria detail' ? false : true
                        }
                      />
                      <div className="d-flex">
                        {isEditMode ? (
                          <>
                            <CButton size="md" className="mr-3" color="warning" onClick={modalConfirm}>
                              Save
                            </CButton>
                            <CButton size="md" className="mr-3" color="warning" onClick={handleCancel}>
                              Cancel
                            </CButton>
                          </>
                        ) : (
                          <CButton size="md" className="mr-3" color="warning" onClick={handleEdit}>
                            Edit
                          </CButton>
                        )}
                      </div>
                    </div>
                  </Skeleton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default ClassEvalCriteriaDetail
